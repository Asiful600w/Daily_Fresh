-- Revert Popularity Feature

-- 1. Drop the trigger and function
DROP TRIGGER IF EXISTS trigger_update_popularity ON order_items;
DROP FUNCTION IF EXISTS update_product_popularity;

-- 2. Remove the sales_count column from products
ALTER TABLE products DROP COLUMN IF EXISTS sales_count;

-- 3. (Optional) If you want to remove the orders system entirely (since it was added for this):
-- DROP TABLE IF EXISTS order_items;
-- DROP TABLE IF EXISTS orders;
