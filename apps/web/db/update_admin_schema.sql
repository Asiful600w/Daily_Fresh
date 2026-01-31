-- 1. Add new columns to admins table
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS notes text;

-- 2. Add constraint for status values
ALTER TABLE public.admins 
DROP CONSTRAINT IF EXISTS allowed_admin_statuses;

ALTER TABLE public.admins 
ADD CONSTRAINT allowed_admin_statuses 
CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));

-- 3. Add constraint for role values
ALTER TABLE public.admins 
DROP CONSTRAINT IF EXISTS allowed_admin_roles;

ALTER TABLE public.admins 
ADD CONSTRAINT allowed_admin_roles 
CHECK (role IN ('super_admin', 'merchant', 'admin', 'viewer'));

-- 4. Update Policies

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Drop existing overlapping policies to be safe
DROP POLICY IF EXISTS "Admins can view admin list" ON public.admins;
DROP POLICY IF EXISTS "Super Admins can manage all" ON public.admins;
DROP POLICY IF EXISTS "Admins can view self" ON public.admins;

-- Policy 1: Super Admins can do EVERYTHING on the admins table
CREATE POLICY "Super Admins can manage all" 
ON public.admins 
FOR ALL 
USING (
  (SELECT role FROM public.admins WHERE id = auth.uid()) = 'super_admin'
);

-- Policy 2: Any Admin (even pending) can view their OWN row (to check status)
CREATE POLICY "Admins can view self" 
ON public.admins 
FOR SELECT 
USING (
  auth.uid() = id
);

-- Note: We assume the Service Role (used in API routes) bypasses RLS, 
-- so we don't need a specific policy for insertion if we use supabaseAdmin in backend.
