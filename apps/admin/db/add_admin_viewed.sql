-- Add is_admin_viewed column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_admin_viewed BOOLEAN DEFAULT FALSE;

-- Update existing orders to be viewed (so we don't get 100 notifications at once)
UPDATE orders SET is_admin_viewed = TRUE WHERE is_admin_viewed IS NULL;
