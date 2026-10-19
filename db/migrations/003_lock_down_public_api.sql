-- Supabase exposes `public` tables through its REST API to holders of the anon key.
-- The app connects to Postgres directly (a role that bypasses RLS), so enabling RLS
-- with no policies denies the REST API everything while leaving the app unaffected.
alter table events enable row level security;
alter table infestations enable row level security;
alter table reports enable row level security;
