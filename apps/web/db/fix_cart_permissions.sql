-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Service role full access carts" ON carts;
DROP POLICY IF EXISTS "Users can delete own cart" ON carts;
DROP POLICY IF EXISTS "Users can insert own cart" ON carts;
DROP POLICY IF EXISTS "Users can manage own cart" ON carts;
DROP POLICY IF EXISTS "Users can update own cart" ON carts;
DROP POLICY IF EXISTS "Users can view own cart" ON carts;

DROP POLICY IF EXISTS "Service role full access cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can manage own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;

-- Enable RLS
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Carts Policies

-- 1. Allow authenticated users to insert their own cart
-- user_id matches auth.uid()
CREATE POLICY "Users can create own cart"
ON carts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Allow authenticated users to view their own cart
CREATE POLICY "Users can view own cart"
ON carts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Allow authenticated users to update their own cart
CREATE POLICY "Users can update own cart"
ON carts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Allow authenticated users to delete their own cart
CREATE POLICY "Users can delete own cart"
ON carts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Cart Items Policies

-- 1. Allow users to view items in their cart
CREATE POLICY "Users can view own cart items"
ON cart_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()
  )
);

-- 2. Allow users to insert items into their cart
CREATE POLICY "Users can insert own cart items"
ON cart_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()
  )
);

-- 3. Allow users to update items in their cart
CREATE POLICY "Users can update own cart items"
ON cart_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()
  )
);

-- 4. Allow users to delete items from their cart
CREATE POLICY "Users can delete own cart items"
ON cart_items FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()
  )
);

-- Service Role (Admin) Access
CREATE POLICY "Service role full access carts"
ON carts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access cart items"
ON cart_items FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
