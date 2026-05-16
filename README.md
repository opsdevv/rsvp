# RSVP PHP + Supabase Project

## Setup Instructions

1. Upload the project to your PHP hosting/server.
2. Create a Supabase project.
3. Create a table called `rsvps`.

## Suggested SQL

```sql
create table rsvps (
    id bigint generated always as identity primary key,
    name text,
    email text,
    phone text,
    attendance text,
    message text,
    created_at timestamp with time zone default now()
);
```

4. In Supabase:
   - Open Table Editor
   - Enable Row Level Security if needed
   - Add INSERT policy for anonymous users

5. Open `config.php`
   Replace:
   - YOUR_PROJECT
   - YOUR_SUPABASE_ANON_KEY

## Run

Open:
http://localhost/rsvp_supabase_project/index.php
