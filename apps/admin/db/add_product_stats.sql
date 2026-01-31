-- Add statistic columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS average_rating numeric(3, 1) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS reviews_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_inside_dhaka numeric(10, 2) DEFAULT 60.00,
ADD COLUMN IF NOT EXISTS shipping_outside_dhaka numeric(10, 2) DEFAULT 120.00,
ADD COLUMN IF NOT EXISTS vendor_name text DEFAULT 'Daily Fresh';

-- Function to calculate and update product rating/count
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
    new_avg numeric;
    new_count integer;
BEGIN
    SELECT 
        COALESCE(AVG(rating), 0.0),
        COUNT(*)
    INTO 
        new_avg,
        new_count
    FROM reviews
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    AND is_hidden = false; -- Only count visible reviews

    UPDATE products
    SET 
        average_rating = ROUND(new_avg, 1),
        reviews_count = new_count
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run on review changes
DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- Optional: Initial Calculation for existing data
-- This is heavier, so maybe run manually or assume starting fresh.
-- But for correctness:
DO $$
DECLARE
    rec record;
BEGIN
    FOR rec IN SELECT DISTINCT product_id FROM reviews LOOP
        -- Calculate stats for each product
        UPDATE products p
        SET 
            average_rating = (SELECT COALESCE(ROUND(AVG(rating), 1), 0) FROM reviews r WHERE r.product_id = p.id AND r.is_hidden = false),
            reviews_count = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.is_hidden = false)
        WHERE p.id = rec.product_id;
    END LOOP;
END $$;
