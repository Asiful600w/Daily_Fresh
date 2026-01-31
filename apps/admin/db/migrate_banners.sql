-- Update existing categories to have a banner (copy icon as fallback if not set)
UPDATE categories SET banner_url = image_url WHERE banner_url IS NULL;

-- Example of setting specific banners for existing categories (You can edit these links)
-- UPDATE categories SET banner_url = 'https://link-to-banner.jpg' WHERE slug = 'fruits';
-- UPDATE categories SET banner_url = 'https://link-to-banner.jpg' WHERE slug = 'vegetables';
