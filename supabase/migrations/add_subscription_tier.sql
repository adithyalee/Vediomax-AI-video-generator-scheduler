-- Create an enum for subscription tiers
create type subscription_tier as enum ('free', 'basic', 'unlimited');

-- Add subscription_tier column to users table with default value 'free'
alter table public.users 
add column subscription_tier subscription_tier not null default 'free';

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
