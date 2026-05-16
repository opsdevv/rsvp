-- Run in Supabase SQL Editor to add optional RSVP fields (no dietary notes).

alter table public.rsvps
  add column if not exists guest_count int not null default 1
    check (guest_count >= 1 and guest_count <= 20);

alter table public.rsvps
  add column if not exists message text
    check (message is null or char_length(message) <= 1000);

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'rsvps' and policyname = 'Allow anonymous RSVP inserts'
  ) then
    create policy "Allow anonymous RSVP inserts"
      on public.rsvps for insert to anon with check (true);
  end if;
end $$;
