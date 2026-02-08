-- Enable RLS on hero_sections if not already enabled
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active hero sections
CREATE POLICY "Allow public read access to active hero sections"
ON hero_sections
FOR SELECT
TO public
USING (is_active = true);

-- Allow admins (full access) - assumming service_role or specific admin roles, 
-- but for now public read is the main missing piece for the landing page.
-- If you need admin write access:
CREATE POLICY "Allow admin full access to hero sections"
ON hero_sections
FOR ALL
TO authenticated
USING (
  exists (
    select 1 from "User" 
    where id = auth.uid() 
    and role in ('SUPERADMIN', 'MERCHANT')
  )
);
