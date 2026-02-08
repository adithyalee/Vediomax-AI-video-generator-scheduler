-- Add the ONE missing column to link Clerk to Supabase
alter table public.users add column user_id text unique not null;
