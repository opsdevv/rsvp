import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Matches Supabase `public.rsvps` (column is `name`, not `full_name`). */
type RsvpRow = {
  name: string;
  email: string;
  attending: boolean;
  guest_count?: number;
  message?: string | null;
};

function readConfig(root: HTMLElement): { url: string; anonKey: string } | null {
  const url = root.dataset.supabaseUrl?.trim() ?? "";
  const anonKey = root.dataset.supabaseAnonKey?.trim() ?? "";
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

function setStatus(el: HTMLElement, kind: "idle" | "ok" | "err", text: string): void {
  el.hidden = false;
  el.dataset.kind = kind;
  el.textContent = text;
}

/** Returns a sync fn to call after programmatic form changes (e.g. reset). */
function bindGuestPartyToggle(root: HTMLElement): () => void {
  const wrap = root.querySelector<HTMLElement>("[data-guest-wrap]");
  const radios = root.querySelectorAll<HTMLInputElement>('input[type="radio"][name="attending"]');
  if (!wrap || radios.length === 0) {
    return (): void => {
      /* no-op */
    };
  }

  const inputs = (): Iterable<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> =>
    wrap.querySelectorAll("input, select, textarea");

  const sync = (): void => {
    const declining = [...radios].some((r) => r.checked && r.value === "no");
    wrap.style.opacity = declining ? "0.45" : "1";
    for (const el of inputs()) {
      el.disabled = declining;
    }
  };

  for (const r of radios) {
    r.addEventListener("change", sync);
  }
  sync();
  return sync;
}

export function mountRsvp(root: HTMLElement): void {
  const syncGuests = bindGuestPartyToggle(root);

  const cfg = readConfig(root);
  const form = root.querySelector<HTMLFormElement>('form[data-role="rsvp-form"]');
  const status = root.querySelector<HTMLElement>('[data-role="status"]');
  const submit = root.querySelector<HTMLButtonElement>('button[type="submit"]');

  if (!form || !status || !submit) return;

  if (!cfg) {
    setStatus(
      status,
      "err",
      "Missing Supabase configuration. For Vite, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env. For PHP, copy config.example.php to config.local.php.",
    );
    submit.disabled = true;
    return;
  }

  const supabase: SupabaseClient = createClient(cfg.url, cfg.anonKey);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.hidden = true;
    submit.disabled = true;

    const fd = new FormData(form);
    const attendingRaw = String(fd.get("attending") ?? "");
    const attending = attendingRaw === "yes";

    const guestCountRaw = String(fd.get("guest_count") ?? "1");
    const guestCount = Math.max(1, Math.min(20, parseInt(guestCountRaw, 10) || 1));

    const note = String(fd.get("message") ?? "").trim();

    const payload: RsvpRow = {
      name: String(fd.get("full_name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim().toLowerCase(),
      attending,
      ...(attending ? { guest_count: guestCount } : {}),
      ...(note ? { message: note } : {}),
    };

    if (!payload.name || !payload.email) {
      setStatus(status, "err", "Please enter your name and email.");
      submit.disabled = false;
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
    if (!emailOk) {
      setStatus(status, "err", "Please enter a valid email address.");
      submit.disabled = false;
      return;
    }

    const { error } = await supabase.from("rsvps").insert(payload);

    if (error) {
      const hint =
        error.code === "PGRST204"
          ? " Database columns may be out of date — run supabase/migrations/20250516010000_extend_rsvps.sql in the Supabase SQL Editor."
          : "";
      setStatus(status, "err", (error.message || "Could not save your RSVP. Please try again.") + hint);
      submit.disabled = false;
      return;
    }

    setStatus(status, "ok", "Thank you — your RSVP has been saved.");
    form.reset();
    submit.disabled = false;
    syncGuests();
  });
}

