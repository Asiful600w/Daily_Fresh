-- Ensure orders table has shipping columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_name TEXT,
ADD COLUMN IF NOT EXISTS shipping_phone TEXT,
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod';

-- Add comment
COMMENT ON COLUMN orders.shipping_name IS 'Name of the person receiving the order';
COMMENT ON COLUMN orders.shipping_phone IS 'Contact number for delivery';
