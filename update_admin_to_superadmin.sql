-- Migration to update ADMIN role to SUPERADMIN in Database

-- 1. Update UserRole Enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPERADMIN';

-- 2. Migrate existing ADMIN users to SUPERADMIN
UPDATE public."User"
SET role = 'SUPERADMIN'::"UserRole"
WHERE role = 'ADMIN'::"UserRole";

-- 3. Update is_admin function to check for SUPERADMIN (No arguments version)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public."User"
    WHERE id = auth.uid()
    AND role = 'SUPERADMIN'
  );
END;
$$;

-- 4. Update is_admin function (UUID version if exists/used)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public."User"
    WHERE id = user_id::text
    AND role = 'SUPERADMIN'
  );
END;
$$;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
