-- Deletes a user from Supabase Auth.
-- Because of 'ON DELETE CASCADE' in public.admins, this will also remove their admin profile.

-- Replace with the email you want to delete
DELETE FROM auth.users WHERE email = 'admin@dailyfresh.com';

-- Verification
SELECT * FROM public.admins WHERE email = 'admin@dailyfresh.com';
