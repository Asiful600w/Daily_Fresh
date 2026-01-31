-- 1. Add sold_count column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sold_count integer DEFAULT 0;

-- 2. Function to update sold_count
CREATE OR REPLACE FUNCTION update_product_sold_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment sold_count on new order item
    UPDATE products
    SET sold_count = sold_count + NEW.quantity
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger for new order items
DROP TRIGGER IF EXISTS on_order_item_insert ON order_items;
CREATE TRIGGER on_order_item_insert
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_product_sold_count();

-- 4. Initial backfill (calculate for existing orders)
DO $$
DECLARE
    rec record;
BEGIN
    FOR rec IN 
        SELECT product_id, SUM(quantity) as total_sold 
        FROM order_items 
        GROUP BY product_id 
    LOOP
        UPDATE products 
        SET sold_count = rec.total_sold
        WHERE id = rec.product_id;
    END LOOP;
END $$;
