-- ==============================================================================
-- Cleanup & Wishlist Update Script
-- ==============================================================================
-- Run this script in the Supabase SQL Editor to:
-- 1. Create the missing 'wishlists' table required for the feature.
-- 2. Clean up unused default NextAuth tables.
-- 3. Ensure 'AuditLog' exists.

-- ------------------------------------------------------------------------------
-- 1. CREATE WISHLISTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. View: Users can see only their own wishlist items
CREATE POLICY "Users can view own wishlist" ON public.wishlists
    FOR SELECT USING (auth.uid()::text = user_id);

-- 2. Insert: Users can add items to their own wishlist
CREATE POLICY "Users can add to own wishlist" ON public.wishlists
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 3. Delete: Users can remove items from their own wishlist
CREATE POLICY "Users can remove from own wishlist" ON public.wishlists
    FOR DELETE USING (auth.uid()::text = user_id);

-- Grant permissions (important for anon/authenticated access via RLS)
GRANT ALL ON public.wishlists TO service_role;
GRANT ALL ON public.wishlists TO postgres;
GRANT SELECT, INSERT, DELETE ON public.wishlists TO anon;
GRANT SELECT, INSERT, DELETE ON public.wishlists TO authenticated;

-- ------------------------------------------------------------------------------
-- 2. ENSURE AUDIT LOG TABLE (Used in Auth Logic)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."AuditLog" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" TEXT REFERENCES public."User"(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    details JSONB
);

-- Enable RLS for AuditLog (Restrictive by default)
ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;

-- Grant permissions to service role (server-side actions use this)
GRANT ALL ON public."AuditLog" TO service_role;
GRANT ALL ON public."AuditLog" TO postgres;

-- ------------------------------------------------------------------------------
-- 3. DROP UNUSED TABLES
-- ------------------------------------------------------------------------------
-- These tables are default NextAuth tables but are unused because:
-- a) We use JWT strategy (no sessions/accounts in DB).
-- b) We use 'User' table for profile data (no profiles table).
-- c) We handle verification purely via logic or don't use the token table yet.

DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.accounts;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.verification_tokens;

-- ------------------------------------------------------------------------------
-- Done!
-- ------------------------------------------------------------------------------
