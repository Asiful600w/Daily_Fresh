-- Add image_url to special_categories for Offer Cards
ALTER TABLE special_categories
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- We already have description, so just ensuring it's used.
-- We might need a flag to show on homepage or not?
-- Let's assume active special categories with an image_url are shown.
