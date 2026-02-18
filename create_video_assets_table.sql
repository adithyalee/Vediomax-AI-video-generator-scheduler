-- Create a table to store generated assets for video projects
create table if not exists public.video_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.video_projects(id) on delete cascade,
  asset_type text not null, -- 'script', 'voice', 'image', 'video'
  url text,               -- Public URL for voice/image/video files
  content text,           -- Content for scripts or prompts
  metadata jsonb default '{}'::jsonb, -- Store extra info like prompt, model used, voice name
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.video_assets enable row level security;

-- Create policies (assuming video_projects.user_id is the owner)

-- 1. View Policy
create policy "Users can view assets for their own projects" on public.video_assets
  for select using (
    exists (
      select 1 from public.video_projects vp
      where vp.id = public.video_assets.project_id
      and vp.user_id = auth.uid()::text
    )
  );

-- 2. Insert Policy (if needed from client side, though generation usually runs via service role)
create policy "Users can insert assets for their own projects" on public.video_assets
  for insert with check (
    exists (
      select 1 from public.video_projects vp
      where vp.id = public.video_assets.project_id
      and vp.user_id = auth.uid()::text
    )
  );

-- 3. Delete Policy
create policy "Users can delete assets for their own projects" on public.video_assets
  for delete using (
    exists (
      select 1 from public.video_projects vp
      where vp.id = public.video_assets.project_id
      and vp.user_id = auth.uid()::text
    )
  );
