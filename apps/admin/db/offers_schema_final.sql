-- Final Schema to add Image URL to Special Categories
-- Run this in your Supabase SQL Editor

ALTER TABLE special_categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verify it exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'special_categories';
