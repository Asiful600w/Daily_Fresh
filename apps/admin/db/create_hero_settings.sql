-- Create table for Hero Section Settings
create table if not exists hero_settings (
  id bigint primary key default 1 check (id = 1), -- Ensure singleton row
  title text not null default 'Quality Food For Your Healthy Life',
  subtitle text not null default 'New Season Freshness',
  description text not null default 'Get up to 50% OFF on your first order. Fresh produce delivered from farm to your doorstep.',
  image_url text not null default 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX7x1HBOqMMI518qHW17jKGkryeaKonnXGEbdkBR4GvbEVZENLzYW_8cEKLeU3nLCoxfDxvRuzBWc2UMxkRlp8Qix2LgxHKpsToQHO10vMCHMKjOmg6ucwmqOZ7GIMiSBIxBw0qaqFeK63SiQ5EQ4C-LMvZy28P7MaNy4uzcV2DaK1H5zIykFWkZMYBE6Xh8ac9E1nba7cTZ14OBTrDW-wpN-j8lDq-VbvUaLl6OtViD2uWDMpEBWT1yXDZluirbsS6BEgrgXwzyI',
  button_text text not null default 'Shop Now',
  button_link text not null default '/shop'
);

-- Enable Row Level Security
alter table hero_settings enable row level security;

-- Create Policy: Allow read access to everyone
create policy "Allow public read access"
  on hero_settings for select
  using (true);

-- Create Policy: Allow update access to authenticated users (admins)
-- Note: In a real app, strict RLS for admins would be better.
create policy "Allow authenticated update access"
  on hero_settings for update
  using (auth.role() = 'authenticated');

-- Insert default row if it doesn't exist
insert into hero_settings (id, title, subtitle, description, image_url, button_text, button_link)
values (
  1,
  'Quality Food For Your Healthy Life',
  'New Season Freshness',
  'Get up to 50% OFF on your first order. Fresh produce delivered from farm to your doorstep.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBX7x1HBOqMMI518qHW17jKGkryeaKonnXGEbdkBR4GvbEVZENLzYW_8cEKLeU3nLCoxfDxvRuzBWc2UMxkRlp8Qix2LgxHKpsToQHO10vMCHMKjOmg6ucwmqOZ7GIMiSBIxBw0qaqFeK63SiQ5EQ4C-LMvZy28P7MaNy4uzcV2DaK1H5zIykFWkZMYBE6Xh8ac9E1nba7cTZ14OBTrDW-wpN-j8lDq-VbvUaLl6OtViD2uWDMpEBWT1yXDZluirbsS6BEgrgXwzyI',
  'Shop Now',
  '/shop'
)
on conflict (id) do nothing;
