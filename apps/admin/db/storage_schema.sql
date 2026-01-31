-- Create the 'hero-images' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('hero-images', 'hero-images', true)
on conflict (id) do nothing;

-- Set up policies for the 'hero-images' bucket

-- 1. Allow public read access to everyone
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'hero-images' );

-- 2. Allow authenticated administrators to upload files
-- Assuming users are authenticated via Supabase Auth
create policy "Authenticated Upload"
on storage.objects for insert
with check ( bucket_id = 'hero-images' and auth.role() = 'authenticated' );

-- 3. Allow authenticated administrators to update/replace files
create policy "Authenticated Update"
on storage.objects for update
using ( bucket_id = 'hero-images' and auth.role() = 'authenticated' );

-- 4. Allow authenticated administrators to delete files
create policy "Authenticated Delete"
on storage.objects for delete
using ( bucket_id = 'hero-images' and auth.role() = 'authenticated' );

-- Create the 'ad-images' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('ad-images', 'ad-images', true)
on conflict (id) do nothing;

-- Set up policies for the 'ad-images' bucket

-- 1. Allow public read access to everyone
create policy "Public Access Ads"
on storage.objects for select
using ( bucket_id = 'ad-images' );

-- 2. Allow authenticated administrators to upload files
create policy "Authenticated Upload Ads"
on storage.objects for insert
with check ( bucket_id = 'ad-images' and auth.role() = 'authenticated' );

-- 3. Allow authenticated administrators to update/replace files
create policy "Authenticated Update Ads"
on storage.objects for update
using ( bucket_id = 'ad-images' and auth.role() = 'authenticated' );

-- 4. Allow authenticated administrators to delete files
create policy "Authenticated Delete Ads"
on storage.objects for delete
using ( bucket_id = 'ad-images' and auth.role() = 'authenticated' );

-- Create the 'category-images' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do nothing;

-- Set up policies for the 'category-images' bucket

-- 1. Allow public read access to everyone
create policy "Public Access Category"
on storage.objects for select
using ( bucket_id = 'category-images' );

-- 2. Allow authenticated administrators to upload files
create policy "Authenticated Upload Category"
on storage.objects for insert
with check ( bucket_id = 'category-images' and auth.role() = 'authenticated' );

-- 3. Allow authenticated administrators to update/replace files
create policy "Authenticated Update Category"
on storage.objects for update
using ( bucket_id = 'category-images' and auth.role() = 'authenticated' );

-- 4. Allow authenticated administrators to delete files
create policy "Authenticated Delete Category"
on storage.objects for delete
using ( bucket_id = 'category-images' and auth.role() = 'authenticated' );

-- Create the 'special-offer-images' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('special-offer-images', 'special-offer-images', true)
on conflict (id) do nothing;

-- Set up policies for the 'special-offer-images' bucket

-- 1. Allow public read access to everyone
create policy "Public Access Special Offers"
on storage.objects for select
using ( bucket_id = 'special-offer-images' );

-- 2. Allow authenticated administrators to upload files
create policy "Authenticated Upload Special Offers"
on storage.objects for insert
with check ( bucket_id = 'special-offer-images' and auth.role() = 'authenticated' );

-- 3. Allow authenticated administrators to update/replace files
create policy "Authenticated Update Special Offers"
on storage.objects for update
using ( bucket_id = 'special-offer-images' and auth.role() = 'authenticated' );

-- 4. Allow authenticated administrators to delete files
create policy "Authenticated Delete Special Offers"
on storage.objects for delete
using ( bucket_id = 'special-offer-images' and auth.role() = 'authenticated' );



