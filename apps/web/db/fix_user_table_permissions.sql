-- Fix permissions for "User" table
-- Run this in Supabase SQL Editor

-- 1. Grant Service Role full access (Service Role usually has this, but good to ensure)
GRANT ALL ON TABLE "User" TO service_role;

-- 2. Grant Postgres/Dashboard user access
GRANT ALL ON TABLE "User" TO postgres;

-- 3. Check if table owner is correct (optional, can't change via SQL editor easily often)

-- 4. If SupabaseAdmin is somehow using Anon key (misconfiguration), 
--    we *could* temporarily allow Anon insert, but that is insecure.
--    Better to relying on Service Role.
--    However, for the 'permission denied' error which might be masking an RLS issue:

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Allow Service Role to bypass (it does by default, but let's clear policies/grants that might block)
-- Ensure 'service_role' has explicit GRANTs.
-- The previous error suggests the role trying to access it (likely 'service_role' or 'anon') was denied.

-- Let's add a policy that allows everything for postgres/service_role just in case
-- (though service_role bypasses RLS, explicit policies can sometimes help if bypass is off?)
-- No, service_role bypasses RLS.

-- Maybe the table is not capitalized?
-- If the error says "table User", it might be case sensitive.
-- We will try to grant for both "User" and "user" just in case one doesn't exist.

DO $$
BEGIN
    -- Try for "User"
    BEGIN
        GRANT ALL ON TABLE "User" TO service_role;
        GRANT SELECT ON TABLE "User" TO anon;  -- Optional: Let anon see users (e.g. "Email taken" check?)
        GRANT SELECT ON TABLE "User" TO authenticated;
    EXCEPTION WHEN undefined_table THEN
        NULL; -- Ignore if table doesn't exist
    END;

    -- Try for public."User" explicit
    BEGIN
        GRANT ALL ON TABLE public."User" TO service_role;
    EXCEPTION WHEN undefined_table THEN
        NULL;
    END;
END $$;

-- If the table is actually 'users' (lowercase) but mapped to 'User'
-- (but find 'User' suggests it exists).

-- Just run this simple grant
GRANT ALL ON TABLE "User" TO service_role;
GRANT SELECT ON TABLE "User" TO anon, authenticated;
-- Warning: Granting INSERT to anon on User table is insecure. 
-- Only specific columns or via function is better. 
-- But since we use server action with supabaseAdmin, it SHOULD use service_role.

