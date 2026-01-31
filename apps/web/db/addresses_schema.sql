-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    label TEXT NOT NULL, -- e.g. "Home", "Work"
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Bangladesh',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own addresses"
    ON addresses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
    ON addresses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
    ON addresses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
    ON addresses FOR DELETE
    USING (auth.uid() = user_id);

-- Function to handle default address logic
-- When a user sets an address as default, unset others
CREATE OR REPLACE FUNCTION handle_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE addresses
        SET is_default = false
        WHERE user_id = NEW.user_id
          AND id <> NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Insert
CREATE TRIGGER set_default_address_insert
    BEFORE INSERT ON addresses
    FOR EACH ROW
    WHEN (NEW.is_default = true)
    EXECUTE FUNCTION handle_default_address();

-- Trigger for Update
CREATE TRIGGER set_default_address_update
    BEFORE UPDATE ON addresses
    FOR EACH ROW
    WHEN (NEW.is_default = true)
    EXECUTE FUNCTION handle_default_address();

-- Auto-set first address as default if user has none
CREATE OR REPLACE FUNCTION set_first_address_default()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT count(*) FROM addresses WHERE user_id = NEW.user_id) = 0 THEN
        NEW.is_default := true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_first_address_default
    BEFORE INSERT ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION set_first_address_default();
