-- Function to increment sales_count
CREATE OR REPLACE FUNCTION update_product_popularity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET sales_count = sales_count + NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on order_items insertion (assuming order_items table exists)
-- If table name is different (e.g. 'order_details'), this needs adjustment.
-- Checking schema first is safer, but assuming standard name for now.
DROP TRIGGER IF EXISTS trigger_update_popularity ON order_items;

CREATE TRIGGER trigger_update_popularity
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_product_popularity();
