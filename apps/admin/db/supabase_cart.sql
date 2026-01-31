-- Create a table for carts (optional wrapper, or we can just stick to items linked to user)
-- A simple approach: strict link between user and items. A 'carts' table is useful for metadata (status, updated_at).

-- 1. Create carts table
create table public.carts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create cart_items table
create table public.cart_items (
  id uuid default gen_random_uuid() primary key,
  cart_id uuid references public.carts(id) on delete cascade not null,
  product_id text not null, -- Using string ID as in the frontend (CartItem.id can be string)
  name text not null,
  price numeric not null,
  image text,
  quantity integer not null default 1,
  category text,
  pack text,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(cart_id, product_id, color) -- Prevent duplicate entries for same product variant
);

-- 3. Enable RLS
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

-- 4. Policies for carts
create policy "Users can view their own cart"
  on public.carts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own cart"
  on public.carts for insert
  with check (auth.uid() = user_id);

-- 5. Policies for cart_items
-- We need to check if the cart_id belongs to the user.
-- Since we enforced 1:1 user:cart, we can simplify join or trust the client sending cart_id (which we verify).

create policy "Users can view their own cart items"
  on public.cart_items for select
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
      and carts.user_id = auth.uid()
    )
  );

create policy "Users can insert their own cart items"
  on public.cart_items for insert
  with check (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
      and carts.user_id = auth.uid()
    )
  );

create policy "Users can update their own cart items"
  on public.cart_items for update
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
      and carts.user_id = auth.uid()
    )
  );

create policy "Users can delete their own cart items"
  on public.cart_items for delete
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
      and carts.user_id = auth.uid()
    )
  );

-- Function to handle Updated At
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.carts
  for each row execute procedure moddatetime (updated_at);

create trigger handle_updated_at before update on public.cart_items
  for each row execute procedure moddatetime (updated_at);
