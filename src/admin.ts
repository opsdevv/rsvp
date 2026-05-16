import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";

export type RsvpRecord = {
  id: string;
  name: string;
  email: string;
  attending: boolean;
  guest_count: number | null;
  message: string | null;
  created_at: string;
};

function readAdminConfig(root: HTMLElement): { url: string; serviceRoleKey: string } | null {
  const url = root.dataset.supabaseUrl?.trim() ?? "";
  const serviceRoleKey = root.dataset.supabaseServiceRoleKey?.trim() ?? "";
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function attendingLabel(attending: boolean): string {
  return attending ? "Attending" : "Declined";
}

function toRecord(row: Record<string, unknown>): RsvpRecord {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    attending: Boolean(row.attending),
    guest_count: typeof row.guest_count === "number" ? row.guest_count : null,
    message: typeof row.message === "string" ? row.message : null,
    created_at: String(row.created_at ?? ""),
  };
}

export function mountAdmin(root: HTMLElement): () => void {
  const cfg = readAdminConfig(root);
  const scope = root.closest("main") ?? document;
  const listEl = root.querySelector<HTMLElement>('[data-role="list"]');
  const emptyEl = root.querySelector<HTMLElement>('[data-role="empty"]');
  const tableWrap = root.querySelector<HTMLElement>(".table-wrap");
  const statusEl = scope.querySelector<HTMLElement>('[data-role="status"]');
  const statsEl = scope.querySelector<HTMLElement>('[data-role="stats"]');
  const liveEl = scope.querySelector<HTMLElement>('[data-role="live"]');

  if (!listEl || !emptyEl || !statusEl) return () => undefined;

  const setStatus = (kind: "ok" | "err" | "info", text: string): void => {
    statusEl.hidden = false;
    statusEl.dataset.kind = kind;
    statusEl.textContent = text;
  };

  if (!cfg) {
    setStatus(
      "err",
      "Missing admin configuration. Set VITE_SUPABASE_SERVICE_ROLE_KEY in .env.local (Vite) or SUPABASE_SERVICE_ROLE_KEY in config.local.php (PHP).",
    );
    return () => undefined;
  }

  const supabase: SupabaseClient = createClient(cfg.url, cfg.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const records = new Map<string, RsvpRecord>();
  let channel: RealtimeChannel | null = null;

  const renderStats = (): void => {
    if (!statsEl) return;
    const all = [...records.values()];
    const yes = all.filter((r) => r.attending).length;
    const no = all.length - yes;
    const guests = all.filter((r) => r.attending).reduce((sum, r) => sum + (r.guest_count ?? 1), 0);
    statsEl.textContent = `${all.length} total · ${yes} attending · ${no} declined · ${guests} guests`;
  };

  const renderRow = (row: RsvpRecord): HTMLTableRowElement => {
    const tr = document.createElement("tr");
    tr.dataset.id = row.id;

    const cells: { text: string; className?: string }[] = [
      { text: row.name },
      { text: row.email },
      { text: attendingLabel(row.attending), className: row.attending ? "pill pill-yes" : "pill pill-no" },
      { text: row.attending ? String(row.guest_count ?? 1) : "—" },
      { text: row.message?.trim() || "—", className: "cell-muted" },
      { text: formatWhen(row.created_at), className: "cell-muted" },
    ];

    for (const { text, className } of cells) {
      const td = document.createElement("td");
      if (className) td.className = className;
      td.textContent = text;
      tr.appendChild(td);
    }

    const actions = document.createElement("td");
    actions.className = "cell-actions";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-delete";
    btn.textContent = "Delete";
    btn.addEventListener("click", () => void deleteRow(row.id, btn));
    actions.appendChild(btn);
    tr.appendChild(actions);

    return tr;
  };

  const syncDom = (): void => {
    listEl.replaceChildren();
    const sorted = [...records.values()].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    for (const row of sorted) {
      listEl.appendChild(renderRow(row));
    }

    const hasRows = sorted.length > 0;
    emptyEl.hidden = hasRows;
    if (tableWrap) tableWrap.hidden = !hasRows;
    renderStats();
  };

  const upsertRecord = (raw: Record<string, unknown>): void => {
    const row = toRecord(raw);
    records.set(row.id, row);
    syncDom();
  };

  const removeRecord = (id: string): void => {
    records.delete(id);
    syncDom();
  };

  const deleteRow = async (id: string, btn: HTMLButtonElement): Promise<void> => {
    const row = records.get(id);
    if (!row) return;
    if (!confirm(`Delete RSVP for ${row.name}?`)) return;

    btn.disabled = true;
    const { error } = await supabase.from("rsvps").delete().eq("id", id);

    if (error) {
      setStatus("err", error.message || "Could not delete RSVP.");
      btn.disabled = false;
      return;
    }

    removeRecord(id);
    statusEl.hidden = true;
  };

  const loadAll = async (): Promise<void> => {
    setStatus("info", "Loading RSVPs…");
    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setStatus("err", error.message || "Could not load RSVPs.");
      return;
    }

    records.clear();
    for (const row of data ?? []) {
      const rec = toRecord(row as Record<string, unknown>);
      records.set(rec.id, rec);
    }
    syncDom();
    statusEl.hidden = true;
  };

  const subscribe = (): void => {
    if (liveEl) {
      liveEl.textContent = "Connecting…";
      liveEl.dataset.state = "pending";
    }

    channel = supabase
      .channel("admin-rsvps")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rsvps" },
        (payload) => {
          upsertRecord(payload.new as Record<string, unknown>);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rsvps" },
        (payload) => {
          upsertRecord(payload.new as Record<string, unknown>);
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "rsvps" },
        (payload) => {
          const old = payload.old as { id?: string };
          if (old.id) removeRecord(old.id);
        },
      )
      .subscribe((status) => {
        if (!liveEl) return;
        if (status === "SUBSCRIBED") {
          liveEl.textContent = "Live";
          liveEl.dataset.state = "on";
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          liveEl.textContent = "Offline";
          liveEl.dataset.state = "off";
        } else {
          liveEl.textContent = "Connecting…";
          liveEl.dataset.state = "pending";
        }
      });
  };

  void loadAll().then(subscribe);

  return () => {
    if (channel) void supabase.removeChannel(channel);
  };
}
