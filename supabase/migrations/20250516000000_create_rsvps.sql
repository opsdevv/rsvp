-- RSVP table: anonymous inserts from the public form (anon key), no public reads.

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) <= 120),
  email text not null check (char_length(email) <= 254),
  attending boolean not null,
  guest_count int not null default 1 check (guest_count >= 1 and guest_count <= 20),
  message text check (message is null or char_length(message) <= 1000)
);

alter table public.rsvps enable row level security;

-- Allow anyone with the anon key to submit one row at a time from the client.
create policy "Allow anonymous RSVP inserts"
  on public.rsvps
  for insert
  to anon
  with check (true);

-- Optional: block anonymous reads (view rows in Supabase dashboard as admin/service role).
create policy "Disallow anonymous selects"
  on public.rsvps
  for select
  to anon
  using (false);
