// Check products table structure
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vaohkfonpifdvwarsnac.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb2hrZm9ucGlmZHZ3YXJzbmFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg5MDA2NywiZXhwIjoyMDg0NDY2MDY3fQ.Xh7zAH_zN9uH6nFjBV_lVtFWUqA_92pDCx0CkwIJJ5Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProductsTable() {
    console.log('Checking products table for duplicates...\n');

    // Check if there are any products
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name')
        .order('id');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Total products: ${products?.length || 0}`);
        if (products && products.length > 0) {
            console.log('Products:', products);

            // Check for duplicate IDs
            const ids = products.map(p => p.id);
            const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
            if (duplicates.length > 0) {
                console.log('\n⚠️ DUPLICATE IDs FOUND:', duplicates);
            } else {
                console.log('\n✅ No duplicate IDs');
            }
        }
    }
}

checkProductsTable();
