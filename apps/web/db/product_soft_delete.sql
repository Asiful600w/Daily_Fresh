-- Add soft delete columns to products table
alter table products
add column if not exists is_deleted boolean default false,
add column if not exists deleted_at timestamp with time zone;

-- Index for performance since we will filter by is_deleted often
create index if not exists idx_products_is_deleted on products(is_deleted);

-- Update RLS policies (if any) to likely exclude deleted items for public
-- But usually, we filter in the query.
-- However, let's create a view for cleaner access if needed, or just rely on the API layer.
-- For now, API layer correctness is enough.
