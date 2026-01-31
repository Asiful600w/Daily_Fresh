-- Admin Policies (for Demo purposes)

-- Allow any authenticated user to VIEW all orders (for Admin Dashboard)
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');

-- Allow any authenticated user to UPDATE orders (for Status Updates)
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Need to also allow viewing items for all orders to populate the dashboard properly
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (auth.role() = 'authenticated');
