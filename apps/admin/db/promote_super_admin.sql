-- Fix for "Access Denied"
-- If the user exists in Auth but not in 'admins' table, insert them.
-- If they exist in 'admins', update them to super_admin/approved.

INSERT INTO public.admins (id, email, role, status)
SELECT id, email, 'super_admin', 'approved'
FROM auth.users
WHERE email = 'aasif.islam234@gmail.com' -- Target email
ON CONFLICT (id) DO UPDATE
SET 
  role = 'super_admin',
  status = 'approved';

-- Verification
SELECT * FROM public.admins WHERE email = 'aasif.islam234@gmail.com';
