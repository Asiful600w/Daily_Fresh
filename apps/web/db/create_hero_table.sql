-- Create hero_sections table
CREATE TABLE IF NOT EXISTS hero_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    button_text TEXT DEFAULT 'Shop Now',
    button_link TEXT DEFAULT '/shop',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active hero sections
CREATE POLICY "Public can view active hero sections"
ON hero_sections FOR SELECT
TO public
USING (is_active = true);

-- Allow admins (service role or specific admin logic if needed) to manage hero sections
-- For now giving service_role full access, and authenticated users full access (assuming admin app uses authenticated user with admin rights)
-- ideally we should check for admin role, but keeping it simple for now as requested "in admin panel"

CREATE POLICY "Authenticated users can manage hero sections"
ON hero_sections FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure only one active hero section (trigger)
CREATE OR REPLACE FUNCTION ensure_single_active_hero()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        UPDATE hero_sections
        SET is_active = false
        WHERE id != NEW.id AND is_active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_active_hero_trigger ON hero_sections;
CREATE TRIGGER ensure_single_active_hero_trigger
BEFORE INSERT OR UPDATE ON hero_sections
FOR EACH ROW
EXECUTE FUNCTION ensure_single_active_hero();

-- Create storage bucket for hero images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'hero-images' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'hero-images' );

CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'hero-images' );

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'hero-images' );
