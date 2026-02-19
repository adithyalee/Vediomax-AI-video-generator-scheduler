-- Create a table to store social media tokens
create table if not exists public.social_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null, -- Links to Clerk user ID or public.users.user_id
  platform text not null, -- 'youtube', 'instagram', 'tiktok'
  access_token text,
  refresh_token text,
  expires_at timestamp with time zone,
  profile_name text,
  profile_url text,
  connected_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent multiple connections of same platform per user
  unique (user_id, platform)
);

-- Enable Row Level Security (RLS)
alter table public.social_integrations enable row level security;

-- Policies
create policy "Users can view their own integrations" on public.social_integrations
  for select using (auth.uid()::text = user_id);

create policy "Users can insert their own integrations" on public.social_integrations
  for insert with check (auth.uid()::text = user_id);

create policy "Users can update their own integrations" on public.social_integrations
  for update using (auth.uid()::text = user_id);

create policy "Users can delete their own integrations" on public.social_integrations
  for delete using (auth.uid()::text = user_id);
