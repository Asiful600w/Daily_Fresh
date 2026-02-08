// Test cart tables
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vaohkfonpifdvwarsnac.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb2hrZm9ucGlmZHZ3YXJzbmFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg5MDA2NywiZXhwIjoyMDg0NDY2MDY3fQ.Xh7zAH_zN9uH6nFjBV_lVtFWUqA_92pDCx0CkwIJJ5Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCartTables() {
    console.log('Checking cart tables...\n');

    // Check carts table
    const { count: cartsCount, error: cartsError } = await supabase
        .from('carts')
        .select('*', { count: 'exact', head: true });

    if (cartsError) {
        console.log('❌ carts table:', cartsError.message);
    } else {
        console.log(`✅ carts table: ${cartsCount || 0} rows`);
    }

    // Check cart_items table
    const { count: itemsCount, error: itemsError } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true });

    if (itemsError) {
        console.log('❌ cart_items table:', itemsError.message);
    } else {
        console.log(`✅ cart_items table: ${itemsCount || 0} rows`);
    }
}

checkCartTables();
