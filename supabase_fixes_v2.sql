-- ==========================================
-- 1. Fix Mutable Search Paths
-- ==========================================
-- Corrected function signatures based on codebase analysis.

-- Trigger functions (take no arguments)
ALTER FUNCTION public.update_product_sold_count() SET search_path = public;
ALTER FUNCTION public.delete_empty_cart() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_product_rating() SET search_path = public;
ALTER FUNCTION public.handle_default_address() SET search_path = public;
ALTER FUNCTION public.set_first_address_default() SET search_path = public;

-- Parameterized functions
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;

-- ==========================================
-- 2. Fix Permissive RLS Policies
-- ==========================================
-- (Same as before, re-included for completeness)

-- --- A. Fix Reviews Table ---
DROP POLICY IF EXISTS "Authenticated users can delete reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews" 
ON public.reviews FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can update reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews" 
ON public.reviews FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- --- B. Fix Products Table ---
DROP POLICY IF EXISTS "Enable update for all users" ON public.products;
CREATE POLICY "Enable update for service role" 
ON public.products FOR UPDATE 
TO service_role 
USING (true) 
WITH CHECK (true);
