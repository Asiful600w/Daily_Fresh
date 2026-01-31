-- Final Fix for Realtime Subscription and Admin Access (Updated)

-- 1. Realtime Publication Settings
-- The error "publication is defined as FOR ALL TABLES" means Realtime is ALREADY enabled for everything.
-- We do NOT need to add tables manually.
-- If you specifically want to limit it later, you would need to recreate the publication, but for now we leave it alone.

-- 2. Reset RLS Policies for Orders to allow Admin Access
-- We need to allow "Authenticated" users (which includes Admins) to see ALL orders.
-- Existing policies might limit users to only see their OWN orders.

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Admins and Customers can view orders" ON orders;

-- Re-create the policy: Allow ANY authenticated user to VIEW ALL orders
-- This is necessary for the Admin Dashboard to work in real-time.
CREATE POLICY "Admins and Customers can view orders" 
ON orders FOR SELECT 
TO authenticated 
USING (true);

-- 3. Fix Connection Permissions (often causes CHANNEL_ERROR)
GRANT SELECT ON orders TO authenticated;
GRANT SELECT ON order_items TO authenticated;

-- 4. Ensure 'is_admin_viewed' exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_admin_viewed BOOLEAN DEFAULT false;
