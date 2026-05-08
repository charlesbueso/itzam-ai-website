-- Seed your admin allowlist here. Run once, then commit alongside your
-- Supabase project. This stays in source control intentionally — emails
-- are not secrets, but rotate via PR.
--
-- Replace the example emails before running.

insert into public.admins (email) values
  ('cbueso@yahoo.com'),
  ('charlesbueso@gmail.com')
on conflict (email) do nothing;
