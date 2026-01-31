-- Enable RLS on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read non-hidden reviews (Public Storefront)
-- Note: 'true' is cleaner if we just want public access, but usually we filter by query.
-- However, RLS is strict. If we have a policy "is_hidden = false", then "select * from reviews" will only return visible ones.
-- This messes up Admin if they want to see all.
-- So we need DIFFERENT policies for different roles, or a single policy that allows everything if you are admin.
-- Since we lack strict roles, let's just allow ALL SELECT for authenticated users (Admin) and maybe rely on query filtering for public?
-- Or, simpler: Allow ALL SELECT for everyone. Query filters hidden.
-- BUT, user asked for "hide it". If RLS hides it, it's safer.

-- Let's try this:
-- 1. Public (anon) can only see visible.
-- 2. Auth (admin/user) can see ALL.

DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON reviews;

CREATE POLICY "Public reviews are viewable by everyone" 
ON reviews FOR SELECT 
TO anon
USING (is_hidden = false);

CREATE POLICY "Authenticated users can view all reviews" 
ON reviews FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert reviews" 
ON reviews FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update reviews" 
ON reviews FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete reviews" 
ON reviews FOR DELETE 
TO authenticated
USING (true);
