// Check products table schema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vaohkfonpifdvwarsnac.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb2hrZm9ucGlmZHZ3YXJzbmFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg5MDA2NywiZXhwIjoyMDg0NDY2MDY3fQ.Xh7zAH_zN9uH6nFjBV_lVtFWUqA_92pDCx0CkwIJJ5Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProductsSchema() {
    console.log('Checking products table schema...\n');

    // Get a sample product to see the structure
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else if (data && data.length > 0) {
        console.log('Sample product columns:', Object.keys(data[0]));
        console.log('\nSample product:', data[0]);
    } else {
        console.log('No products found. Checking table structure...');

        // Try to insert a test product to see what columns are expected
        const testProduct = {
            name: 'Test Product',
            price: 100,
            category_id: '1',
            subcategory_id: '1',
            description: 'Test',
            images: ['test.jpg'],
            stock: 10
        };

        const { error: insertError } = await supabase
            .from('products')
            .insert([testProduct]);

        if (insertError) {
            console.error('Insert test error:', insertError);
        }
    }

    // Check storage buckets
    console.log('\n\nChecking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
    } else {
        console.log('Available buckets:', buckets.map(b => b.name));
    }
}

checkProductsSchema();
