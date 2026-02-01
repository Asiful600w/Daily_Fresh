-- 1. Update admins table to support Merchants
ALTER TABLE public.admins
ADD COLUMN IF NOT EXISTS shop_name text;

-- 2. Update products table for Merchant ownership and approval
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS merchant_id uuid REFERENCES public.admins(id),
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT true, -- Existing products are approved
ADD COLUMN IF NOT EXISTS shop_name text DEFAULT 'Daily Fresh';

-- 3. RLS for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy: Merchants can insert their own products
CREATE POLICY "Merchants can insert own products"
ON public.products
FOR INSERT
WITH CHECK (
  auth.uid() = merchant_id
);

-- Policy: Merchants can update their own products
CREATE POLICY "Merchants can update own products"
ON public.products
FOR UPDATE
USING (
  auth.uid() = merchant_id
);

-- Policy: Merchants can delete their own products
CREATE POLICY "Merchants can delete own products"
ON public.products
FOR DELETE
USING (
  auth.uid() = merchant_id
);

-- Policy: Everyone can read approved products
-- (Existing policies might need adjustment, ensure this doesn't conflict)
-- We'll assume the basic "public read" policy exists, we adding filter
-- DROP POLICY IF EXISTS "Public can view products" ON public.products;
-- CREATE POLICY "Public can view approved products"
-- ON public.products
-- FOR SELECT
-- USING (
--   is_approved = true OR 
--   (auth.uid() = merchant_id) OR
--   (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND role = 'super_admin'))
-- );
-- Note: Modifying existing SELECT policy requires knowing its name. 
-- Ideally we append logic. For now, let's just add comments or assume we need to replace it manually.

-- 4. Update Orders or Order Items to track Merchant
-- Ideally `order_items` should link to the product's merchant
-- We can rely on the product relationship, but denormalizing might be faster for queries.
-- Let's stick to JOINs for now to avoid massive schema changes.

-- 5. Grant permissions if needed
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO service_role;
