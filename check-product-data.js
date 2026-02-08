// Check actual product data in database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vaohkfonpifdvwarsnac.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb2hrZm9ucGlmZHZ3YXJzbmFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg5MDA2NywiZXhwIjoyMDg0NDY2MDY3fQ.Xh7zAH_zN9uH6nFjBV_lVtFWUqA_92pDCx0CkwIJJ5Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProducts() {
    console.log('Checking products in database...\n');

    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Total products fetched: ${products?.length || 0}\n`);

        if (products && products.length > 0) {
            products.forEach((product, index) => {
                console.log(`\n=== Product ${index + 1} ===`);
                console.log('ID:', product.id);
                console.log('Name:', product.name);
                console.log('Category:', product.category);
                console.log('Category ID:', product.category_id);
                console.log('Subcategory:', product.subcategory);
                console.log('Subcategory ID:', product.subcategory_id);
                console.log('Merchant ID:', product.merchant_id);
                console.log('Images:', product.images);
                console.log('Price:', product.price);
                console.log('Stock:', product.stock_quantity);
            });
        } else {
            console.log('No products found in database.');
        }
    }

    // Check storage
    console.log('\n\n=== Checking Storage ===');
    const { data: files, error: storageError } = await supabase
        .storage
        .from('product-images')
        .list('', { limit: 10 });

    if (storageError) {
        console.error('Storage error:', storageError);
    } else {
        console.log('Files in product-images bucket:', files?.length || 0);
        if (files && files.length > 0) {
            files.forEach(file => {
                console.log('  -', file.name);
            });
        }
    }
}

checkProducts();
