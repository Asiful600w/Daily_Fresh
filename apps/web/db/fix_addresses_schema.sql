-- ==============================================================================
-- Fix Addresses Schema
-- ==============================================================================
-- 1. Drop existing table to clean up schema mismatch
DROP TABLE IF EXISTS public.addresses;

-- 2. Recreate with correct references
CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- "Home", "Work", etc.
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Bangladesh',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- We are using Server Actions with Service Role for this, so we mainly need to ensure
-- the Service Role has access.
GRANT ALL ON public.addresses TO service_role;
GRANT ALL ON public.addresses TO postgres;

-- Optional: Allow authenticated users to read their own addresses directly (if using client-side fetch)
CREATE POLICY "Users can view own addresses" ON public.addresses
    FOR SELECT USING (auth.uid()::text = user_id);

-- 5. Auto-update Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_addresses_updated_at
    BEFORE UPDATE ON public.addresses
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- 6. Default Address Management Logic
CREATE OR REPLACE FUNCTION handle_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE public.addresses
        SET is_default = false
        WHERE user_id = NEW.user_id
          AND id <> NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_default_address_insert
    BEFORE INSERT ON public.addresses
    FOR EACH ROW
    WHEN (NEW.is_default = true)
    EXECUTE PROCEDURE handle_default_address();

CREATE TRIGGER set_default_address_update
    BEFORE UPDATE ON public.addresses
    FOR EACH ROW
    WHEN (NEW.is_default = true)
    EXECUTE PROCEDURE handle_default_address();

-- Auto-set first address as default
CREATE OR REPLACE FUNCTION set_first_address_default()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT count(*) FROM public.addresses WHERE user_id = NEW.user_id) = 0 THEN
        NEW.is_default := true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_first_address_default
    BEFORE INSERT ON public.addresses
    FOR EACH ROW
    EXECUTE PROCEDURE set_first_address_default();
