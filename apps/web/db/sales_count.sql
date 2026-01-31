-- Add sales_count to products for sorting by popularity
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

-- Optional: Create index for faster sorting
CREATE INDEX IF NOT EXISTS idx_products_sales_count ON products(sales_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
