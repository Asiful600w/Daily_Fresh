-- Add shipping and payment details to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_name TEXT,
ADD COLUMN IF NOT EXISTS shipping_phone TEXT,
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod';

-- Add comment
COMMENT ON COLUMN orders.shipping_address IS 'Snapshotted full address at time of order';
