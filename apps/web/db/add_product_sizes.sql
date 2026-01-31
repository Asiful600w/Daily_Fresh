-- Add sizes array column to products table
alter table products
add column if not exists sizes text[] default '{}';
