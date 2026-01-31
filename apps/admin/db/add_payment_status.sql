-- Add payment_status column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Add comment
COMMENT ON COLUMN orders.payment_status IS 'Status of the payment: pending, paid, failed, refunded';
