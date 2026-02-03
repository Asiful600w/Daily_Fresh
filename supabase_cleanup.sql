-- ==========================================
-- Supabase Cleanup & Reconciliation Script
-- ==========================================
-- This script ensures valid ownership for RLS policies
-- and syncs data between auth.users and public.User

-- 1. Sync any missing users from auth.users to public.User
--    (Critical for RLS policies that check public.User roles)
INSERT INTO public."User" (id, email, role, "createdAt", "updatedAt")
SELECT 
    au.id::text, -- Cast UUID to text to match Prisma schema
    au.email, 
    'CUSTOMER', -- Default to CUSTOMER, manual promotion needed for ADMIN
    au.created_at, 
    NOW()
FROM auth.users au
LEFT JOIN public."User" pu ON au.id::text = pu.id -- Corrected Type Mismatch
WHERE pu.id IS NULL;

-- 2. Fix Orphaned Products (Assign to a fallback admin or service role placeholder)
--    If you have a known admin ID, replace user_id below. 
--    For now, we just ensure they aren't completely broken if RLS requires an owner.
--    NOTE: Products table usually doesn't enforce user_id ownership for VIEWING, 
--    but for updates it might. This script assumes Products are global.

-- 3. Fix Orphaned Reviews
--    Delete reviews where the user no longer exists (Clean up)
DELETE FROM public.reviews
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 4. Ensure Admin Users are properly flagged
--    Set specific known emails to ADMIN (Replace with actual admin emails)
--    Update this list with actual admin emails
UPDATE public."User"
SET role = 'ADMIN'
WHERE email IN (
    'admin@dailyfresh.com', 
    'asiful600w@gmail.com' 
);

-- 5. Grant permissions (Double check)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
