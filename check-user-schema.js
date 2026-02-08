// Quick script to check User table schema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vaohkfonpifdvwarsnac.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb2hrZm9ucGlmZHZ3YXJzbmFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg5MDA2NywiZXhwIjoyMDg0NDY2MDY3fQ.Xh7zAH_zN9uH6nFjBV_lVtFWUqA_92pDCx0CkwIJJ5Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserTable() {
    // Get a sample user to see the ID type
    const { data, error } = await supabase
        .from('User')
        .select('id, email, role')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Sample User:', data);
        if (data && data.length > 0) {
            console.log('ID value:', data[0].id);
            console.log('ID type:', typeof data[0].id);
        }
    }
}

checkUserTable();
