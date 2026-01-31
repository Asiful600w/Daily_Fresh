-- Enable Realtime for orders table
-- This is often required for the 'postgres_changes' subscription to work
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- Ensure shipping columns exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;

-- CRITICAL: Allow Admins to view all orders for Realtime to work
-- Since we don't have a strict role system, we will allow Authenticated users to view all orders.
-- Ideally, you should restrict this to specific emails or roles.
CREATE POLICY "Enable read access for all users" ON orders FOR SELECT TO authenticated USING (true);
