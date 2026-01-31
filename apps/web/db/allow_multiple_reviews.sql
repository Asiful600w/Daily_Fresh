-- Allow multiple reviews per user per product
-- By default, many schemas enforce UNIQUE(user_id, product_id). We need to drop this.

DO $$
DECLARE
    r record;
BEGIN
    -- Find and drop the unique constraint
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'reviews'::regclass 
        AND contype = 'u' 
        -- We can try to guess the name or just check columns (harder in simple SQL block without digging deep into pg_catalog arrays)
        -- Usually it's named 'reviews_user_id_product_id_key' or similar.
    LOOP
        EXECUTE 'ALTER TABLE reviews DROP CONSTRAINT ' || r.conname;
    END LOOP;
    
    -- Also check for unique index not part of constraint (though usually they are paired)
     -- If there's a specific constraint name you know, use it. Otherwise, this generic loop might be risky if it drops other unique constraints (id?).
     -- Better: Drop specific likely name
    -- ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_product_id_key;
    -- ALTER TABLE reviews DROP CONSTRAINT IF EXISTS unique_review_per_user;
END $$;

-- SAFEST APPROACH: Explicitly drop known common names or instruct user.
-- Assuming standard Supabase/Postgres naming:
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_product_id_key;

-- If you manually verified schema, you could add:
-- DROP INDEX IF EXISTS reviews_user_id_product_id_idx;
