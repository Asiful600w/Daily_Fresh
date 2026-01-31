-- 1. Add 'images' column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- 2. Migrate existing image_url data to images array
UPDATE products 
SET images = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND image_url != '' AND images = '{}';

-- 3. Drop the old image_url column
ALTER TABLE products DROP COLUMN IF EXISTS image_url;

-- 4. Create 'product-images' bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 5. Set up policies for 'product-images'
-- Drop existing policies if any to avoid conflicts during re-runs (optional but safer)
drop policy if exists "Public Access Product Images" on storage.objects;
drop policy if exists "Authenticated Upload Product Images" on storage.objects;
drop policy if exists "Authenticated Update Product Images" on storage.objects;
drop policy if exists "Authenticated Delete Product Images" on storage.objects;

-- Allow public read access
create policy "Public Access Product Images"
on storage.objects for select
using ( bucket_id = 'product-images' );

-- Allow authenticated users to upload (Admin usage)
create policy "Authenticated Upload Product Images"
on storage.objects for insert
with check ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

-- Allow authenticated users to update
create policy "Authenticated Update Product Images"
on storage.objects for update
using ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

-- Allow authenticated users to delete
create policy "Authenticated Delete Product Images"
on storage.objects for delete
using ( bucket_id = 'product-images' and auth.role() = 'authenticated' );
