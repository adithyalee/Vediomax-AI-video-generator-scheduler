-- Create a users table
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null unique, 
  email text not null,
  name text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Create a policy that allows users to see update only their own profile
create policy "Users can view their own profile" on public.users
  for select using (auth.uid()::text = user_id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid()::text = user_id);
