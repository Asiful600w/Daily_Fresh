const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vaohkfonpifdvwarsnac.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb2hrZm9ucGlmZHZ3YXJzbmFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg5MDA2NywiZXhwIjoyMDg0NDY2MDY3fQ.Xh7zAH_zN9uH6nFjBV_lVtFWUqA_92pDCx0CkwIJJ5Q';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkLowStock() {
    console.log('Checking Low Stock Products (Threshold 20, All Status)...');

    const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity, is_deleted')
        .lte('stock_quantity', 20); // Widened search

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${data.length} products with stock <= 20.`);
    data.forEach(p => {
        console.log(`- ${p.name} (Stock: ${p.stock_quantity}, Deleted: ${p.is_deleted})`);
    });
}

checkLowStock();
