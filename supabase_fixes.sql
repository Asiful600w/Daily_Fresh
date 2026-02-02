-- ==========================================
-- 1. Fix Mutable Search Paths
-- ==========================================
-- Security Best Practice: Always set a fixed search_path for functions to prevent hijacking.

ALTER FUNCTION public.update_product_sold_count(BIGINT, INTEGER) SET search_path = public;
ALTER FUNCTION public.delete_empty_cart() SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_product_rating(BIGINT) SET search_path = public;
ALTER FUNCTION public.handle_default_address() SET search_path = public;
ALTER FUNCTION public.set_first_address_default() SET search_path = public;

-- ==========================================
-- 2. Fix Permissive RLS Policies
-- ==========================================

-- --- A. Fix Reviews Table ---
-- Current issue: Authenticated users can delete/update ANY review.
-- Fix: Authenticated users can only delete/update THEIR OWN reviews.

-- 1. Drop bad DELETE policy
DROP POLICY IF EXISTS "Authenticated users can delete reviews" ON public.reviews;
-- 2. Create stricter DELETE policy
CREATE POLICY "Users can delete own reviews" 
ON public.reviews FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 3. Drop bad UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update reviews" ON public.reviews;
-- 4. Create stricter UPDATE policy
CREATE POLICY "Users can update own reviews" 
ON public.reviews FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- --- B. Fix Products Table ---
-- Current issue: "Enable update for all users" allows anyone to update products.
-- Fix: Only allow admins to update products. 
-- Note: Requires `is_admin()` function or service_role check. 
-- Assuming service_role is used for admin panel updates usually, or we use public.is_admin();

DROP POLICY IF EXISTS "Enable update for all users" ON public.products;

-- If you are using the Admin Panel which uses the service_role key:
CREATE POLICY "Enable update for service role" 
ON public.products FOR UPDATE 
TO service_role 
USING (true) 
WITH CHECK (true);

-- If you want to allow "Admins" logged in via normal Auth to update:
-- CREATE POLICY "Enable update for admins" 
-- ON public.products FOR UPDATE 
-- TO authenticated 
-- USING (public.is_admin()) 
-- WITH CHECK (public.is_admin());
