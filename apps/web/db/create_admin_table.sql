-- Create a dedicated table for Admin Users
-- This strictly separates "Who is an Admin" from regular users.
-- Even if someone signs up with an email, they cannot access Admin Panel unless their ID is in this table.

create table if not exists public.admins (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text default 'admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.admins enable row level security;

-- Policy: Admins can read the admins table (to check their own status)
create policy "Admins can view admin list" on public.admins
  for select using (auth.uid() = id);

-- Function to check if a user is an admin
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (select 1 from public.admins where id = user_id);
end;
$$ language plpgsql security definer;
