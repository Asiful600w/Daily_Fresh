-- EMERGENCY CONNECTIVITY FIX
-- This script DISABLES security policies on the cart tables to ensure the specific user can read their data.
-- Use this if you see data in the dashboard but the app shows 0 items.

ALTER TABLE public.carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items DISABLE ROW LEVEL SECURITY;

-- If you prefer not to disable RLS, ensure this simple policy exists:
-- DROP POLICY IF EXISTS "Public access to carts (Debug)" ON public.carts;
-- CREATE POLICY "Public access to carts (Debug)" ON public.carts FOR ALL USING (true);
