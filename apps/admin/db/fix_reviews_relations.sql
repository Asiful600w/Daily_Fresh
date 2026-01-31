-- Fix relationships for Reviews table to allow Supabase joins

-- 1. Ensure product_id is a Foreign Key to products
-- We use DO block to avoid error if constraint already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'reviews_product_id_fkey'
    ) THEN
        ALTER TABLE reviews
        ADD CONSTRAINT reviews_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Ensure user_id is a Foreign Key to profiles (or auth.users, but profiles is what we query)
-- Usually profiles.id is same as auth.users.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'reviews_user_id_fkey'
    ) THEN
        ALTER TABLE reviews
        ADD CONSTRAINT reviews_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Refresh schema cache (Commented out as it's an API action, but modifying schema usually triggers it)
-- NOTIFY pgrst, 'reload config';
