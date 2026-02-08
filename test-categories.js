// Test script to check Supabase categories
// Run with: node test-categories.js

const { createClient } = require('@supabase/supabase-js');

// Hardcoded credentials from .env.local
const supabaseUrl = 'https://vaohkfonpifdvwarsnac.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb2hrZm9ucGlmZHZ3YXJzbmFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg5MDA2NywiZXhwIjoyMDg0NDY2MDY3fQ.Xh7zAH_zN9uH6nFjBV_lVtFWUqA_92pDCx0CkwIJJ5Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testCategories() {
    console.log('🔍 Testing Supabase Connection...\n');

    // Test 1: Simple select
    console.log('Test 1: Fetching all categories (simple query)');
    const { data: simpleData, error: simpleError } = await supabase
        .from('categories')
        .select('*');

    if (simpleError) {
        console.error('❌ Error:', simpleError.message);
        console.error('Full error:', JSON.stringify(simpleError, null, 2));
    } else {
        console.log(`✅ Found ${simpleData.length} categories`);
        if (simpleData.length > 0) {
            console.log('Categories:', simpleData.map(c => c.name).join(', '));
        } else {
            console.log('⚠️  Categories table is EMPTY!');
        }
    }

    console.log('\n---\n');

    // Test 2: Query with subcategories join
    console.log('Test 2: Fetching categories with subcategories');
    const { data: joinData, error: joinError } = await supabase
        .from('categories')
        .select(`
            id, name, slug, image_url, banner_url,
            subcategories (
                id, name
            )
        `)
        .order('name', { ascending: true });

    if (joinError) {
        console.error('❌ Error:', joinError.message);
        console.error('Full error:', JSON.stringify(joinError, null, 2));
    } else {
        console.log(`✅ Found ${joinData.length} categories with subcategories`);
        if (joinData.length > 0) {
            joinData.forEach(cat => {
                console.log(`  - ${cat.name}: ${cat.subcategories?.length || 0} subcategories`);
            });
        }
    }

    console.log('\n---\n');

    // Test 3: Check if tables exist
    console.log('Test 3: Checking if required tables exist');
    const tables = ['categories', 'subcategories', 'notices', 'ad_scrolls', 'hero_settings'];

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`❌ ${table}: ${error.message}`);
        } else {
            console.log(`✅ ${table}: ${count || 0} rows`);
        }
    }

    console.log('\n✅ Test complete!\n');
}

testCategories().catch(console.error);
