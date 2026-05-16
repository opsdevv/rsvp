-- Enable live updates on the admin dashboard (Supabase → SQL Editor).

alter publication supabase_realtime add table public.rsvps;
