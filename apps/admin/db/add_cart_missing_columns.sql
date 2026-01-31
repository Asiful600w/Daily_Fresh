-- Fix missing columns in cart_items table
-- The original schema might have missed 'size', causing inserts to fail.

ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS size text;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS pack text;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS image text;
