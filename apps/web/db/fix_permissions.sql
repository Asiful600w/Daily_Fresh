-- Comprehensive Permission Fix
-- Run this in Supabase SQL Editor

-- 1. Ensure public schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Grant basic table permissions to usage roles
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Explicitly for the tables we care about (in case they were excluded from ALL)
GRANT SELECT ON TABLE categories TO anon, authenticated;
GRANT SELECT ON TABLE subcategories TO anon, authenticated;
GRANT SELECT ON TABLE products TO anon, authenticated;
GRANT SELECT ON TABLE special_categories TO anon, authenticated;

-- 3. RLS Policies (Idempotent)

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view categories" ON categories;
CREATE POLICY "Public can view categories" ON categories FOR SELECT TO public USING (true);

-- Subcategories
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view subcategories" ON subcategories;
CREATE POLICY "Public can view subcategories" ON subcategories FOR SELECT TO public USING (true);

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view products" ON products;
CREATE POLICY "Public can view products" ON products FOR SELECT TO public USING (true);

-- Special Categories
ALTER TABLE special_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view special_categories" ON special_categories;
CREATE POLICY "Public can view special_categories" ON special_categories FOR SELECT TO public USING (true);
