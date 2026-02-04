-- Seed Categories and Subcategories
-- Run this in Supabase SQL Editor to populate your tables with initial data.

-- We use a DO block to use variables (cat_id) for linking subcategories.
DO $$
DECLARE
    cat_id uuid;
BEGIN
    -- 1. Groceries
    INSERT INTO categories (name, slug, image_url, is_hidden)
    VALUES (
        'Groceries', 
        'groceries', 
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBXFK8_zOHAwizhi9I_ZM4eYyzJaaOJ-xkPFv5hgSaYX16cTVOCzhPrANrtaupqZUGUOU5QP6Nqd2rFxsRxCDmKcJIRJ5KV3b_B0bCDvviZyCmcsITOKsEHqGjo_tB4uG7hErkzE7D9Y-TCBZEfp39lP-Z7VLrVDEqQzovP1TaESzFHoODRgH1aCMGIL3Mp7OUMo4WwJF4Vzkl8ovOu9Cf09rNjY_9Y-uAQw04UDh49WOVuY4jRDhNjbYzDv1Jwd4KRcCQiqMXu7aI',
        false
    ) RETURNING id INTO cat_id;

    INSERT INTO subcategories (category_id, name) VALUES 
    (cat_id, 'Staples'),
    (cat_id, 'Spices'),
    (cat_id, 'Organic Foods');

    -- 2. Meat & Fish
    INSERT INTO categories (name, slug, image_url, is_hidden)
    VALUES (
        'Meat & Fish', 
        'meat-fish', 
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD7BeBSg1SYIWyZuaJ9EbNDoYW5jlBH0cTBjRU0v0tqotRb8GdyireYGqKZseHqCg567wC1GVHHq8SbrM14IxDyuvDITH3nJ6oXbKLUXyNynQYC0pfoM61rLRg_ZjUDy3Z0iJVqtEpQezKjr9iHy2Gc2f6Gma3b_5h_Rvb-dcjIW2_FewpGV9atOIkBj1xzw35WXO9uhG3IeC65j8av7KV3rNgfeWTuNomXMzJss1CuGjukX7Yi2ZrjPa6M52wlidWwO8yjDBYbH2I',
        false
    ) RETURNING id INTO cat_id;

    INSERT INTO subcategories (category_id, name) VALUES 
    (cat_id, 'Beef'),
    (cat_id, 'Chicken'),
    (cat_id, 'Seafood');

    -- 3. Fruits & Vegetables
    INSERT INTO categories (name, slug, image_url, is_hidden)
    VALUES (
        'Fruits & Vegetables', 
        'fruits-vegetables', 
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAHpcMEzOrotSUx6AJAeMsAAn5FBRuBTCQVjyWbCzfF3AJbFfP7rvcGXLpW-gwonCcbsd6bJWu-UloS2ecyTDPD3GdYoQ0uw9vjVr3LBRAii1AYrL4uMFGpR1n0f17HR1G4haU3GC7fJON2oOVjT1De5lMMBhxUjhAoiXCoeVGjaQwSMYLbCl_iqjNkYPis2K5cSwdA64L2BEyGU_LnQgRecWhw55T49dClGohURiAPo2-YbdrRW1fvmI-PXR4kmuHDQmv2D2jvFAA',
        false
    ) RETURNING id INTO cat_id;

    INSERT INTO subcategories (category_id, name) VALUES 
    (cat_id, 'Fruits'),
    (cat_id, 'Vegetables'),
    (cat_id, 'Leafy Greens');

    -- 4. Dairy & Bakery
    INSERT INTO categories (name, slug, image_url, is_hidden)
    VALUES (
        'Dairy & Bakery', 
        'dairy-bakery', 
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBweRa1PhrTjQV03LgLCjoAR10lwXlMTdixehC3FxhS-rvMEdA6SmhxTfVS60AfeplKnj4pUai4Mw73uBei0c0gHNYy8aSWysBhnRIJtqqRqjjtu0MMthaZaJVXjx4-wFvg5ytbpDIvEAhjQIJXqr9_aME0Tlng0qoF6nHQL1brxLmdJrilEOac_CoKQC6gOKFeDqXZJiGasQHhxhnmtii1v__x8F0xvwgsyK1pDamAESfY7-zDv0-Vh2Eglo9EYoN691PDddT1Vog',
        false
    ) RETURNING id INTO cat_id;

    INSERT INTO subcategories (category_id, name) VALUES 
    (cat_id, 'Milk'),
    (cat_id, 'Cheese'),
    (cat_id, 'Yogurt'),
    (cat_id, 'Eggs'),
    (cat_id, 'Bread'),
    (cat_id, 'Biscuits'),
    (cat_id, 'Cakes');

    -- 5. Snacks
    INSERT INTO categories (name, slug, image_url, is_hidden)
    VALUES (
        'Snacks', 
        'snacks', 
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAHpcMEzOrotSUx6AJAeMsAAn5FBRuBTCQVjyWbCzfF3AJbFfP7rvcGXLpW-gwonCcbsd6bJWu-UloS2ecyTDPD3GdYoQ0uw9vjVr3LBRAii1AYrL4uMFGpR1n0f17HR1G4haU3GC7fJON2oOVjT1De5lMMBhxUjhAoiXCoeVGjaQwSMYLbCl_iqjNkYPis2K5cSwdA64L2BEyGU_LnQgRecWhw55T49dClGohURiAPo2-YbdrRW1fvmI-PXR4kmuHDQmv2D2jvFAA',
        false
    ) RETURNING id INTO cat_id;

    INSERT INTO subcategories (category_id, name) VALUES 
    (cat_id, 'Chips'),
    (cat_id, 'Noodles'),
    (cat_id, 'Cookies'),
    (cat_id, 'Instant Foods');

    -- 6. Beverages
    INSERT INTO categories (name, slug, image_url, is_hidden)
    VALUES (
        'Beverages', 
        'beverages', 
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBHcQleevS5ZZr5bEsdVVZXLlo1ZVPlwV5E5CxY7yjCTssZ6xkup54UYs1ATOS0oYmNZp-LO64p5zL8sd6HIMQyShUGlUoSZJ_u75G593BGbTmsAIV8IOWnjhC9XbFOWiRh5qcTfTmI47CxSzWxoneUZSOB0U9YIWU1qhBW8iDm9p-x62jeQ4u_WpVR_zF_877ZZMjRn6SAyI8fSGx5Hwjdu90Q2ioI452D5PrI_VtPgAtDi7YwBs1QF9zum1JFfEVcN_-dlfYfOdo',
        false
    ) RETURNING id INTO cat_id;

    INSERT INTO subcategories (category_id, name) VALUES 
    (cat_id, 'Juices'),
    (cat_id, 'Soft Drinks'),
    (cat_id, 'Energy Drinks');

    -- 7. Health & Care
    INSERT INTO categories (name, slug, image_url, is_hidden)
    VALUES (
        'Health & Care', 
        'health-care', 
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAHpcMEzOrotSUx6AJAeMsAAn5FBRuBTCQVjyWbCzfF3AJbFfP7rvcGXLpW-gwonCcbsd6bJWu-UloS2ecyTDPD3GdYoQ0uw9vjVr3LBRAii1AYrL4uMFGpR1n0f17HR1G4haU3GC7fJON2oOVjT1De5lMMBhxUjhAoiXCoeVGjaQwSMYLbCl_iqjNkYPis2K5cSwdA64L2BEyGU_LnQgRecWhw55T49dClGohURiAPo2-YbdrRW1fvmI-PXR4kmuHDQmv2D2jvFAA',
        false
    ) RETURNING id INTO cat_id;

    INSERT INTO subcategories (category_id, name) VALUES 
    (cat_id, 'Baby Food'),
    (cat_id, 'Diapers'),
    (cat_id, 'Personal Care'),
    (cat_id, 'First Aid');

    -- 8. Fashion
    INSERT INTO categories (name, slug, image_url, is_hidden)
    VALUES (
        'Fashion', 
        'fashion', 
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD65BJL0r1X8Npp05j0dH01w9PaEy72vCm25F5Z2k81SlsKaQVDxR8ABDXhMG5tP7Sm97zkv_vrjAesoljrTKYml1nXRoYwUhalbeSfNM_jqtkRaM3eVgco6gfUHXzySrs_PNb7razmQFqVIeZterdllROAFGSMNiKmMfAPtICJ4t8C_T8jD4TZAjuplMArHQ86DMi6CPHndHuC0FLC6f_Fxlex_EyV14aUlbash-rxbZc0GCGcs7y_R-gGSX7lBiPHSEwzARMRUTo',
        false
    ) RETURNING id INTO cat_id;

    INSERT INTO subcategories (category_id, name) VALUES 
    (cat_id, 'Men''s Fashion'),
    (cat_id, 'Women''s Fashion'),
    (cat_id, 'Kids'' Fashion');

END $$;
