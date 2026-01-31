-- Add is_hidden column to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;
