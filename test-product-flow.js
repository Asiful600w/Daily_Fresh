// Test product creation and image upload flow
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vaohkfonpifdvwarsnac.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb2hrZm9ucGlmZHZ3YXJzbmFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg5MDA2NywiZXhwIjoyMDg0NDY2MDY3fQ.Xh7zAH_zN9uH6nFjBV_lVtFWUqA_92pDCx0CkwIJJ5Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testProductFlow() {
    console.log('=== Testing Product Creation Flow ===\n');

    // Check latest product
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (products && products.length > 0) {
        const product = products[0];
        console.log('Latest Product:');
        console.log('  ID:', product.id);
        console.log('  Name:', product.name);
        console.log('  Category:', product.category);
        console.log('  Category ID:', product.category_id);
        console.log('  Subcategory:', product.subcategory);
        console.log('  Subcategory ID:', product.subcategory_id);
        console.log('  Merchant ID:', product.merchant_id);
        console.log('  Images:', product.images);
        console.log('  Image Count:', product.images?.length || 0);

        // Check storage for this product
        if (product.id) {
            console.log('\n=== Checking Storage for Product ID:', product.id, '===');
            const { data: files, error: storageError } = await supabase
                .storage
                .from('product-images')
                .list(String(product.id));

            if (storageError) {
                console.error('Storage error:', storageError);
            } else {
                console.log('Files in product-images/' + product.id + ':', files?.length || 0);
                if (files && files.length > 0) {
                    files.forEach(file => {
                        console.log('  -', file.name);
                    });
                }
            }
        }
    } else {
        console.log('No products found.');
    }
}

testProductFlow();
