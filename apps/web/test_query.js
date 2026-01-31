const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vaohkfonpifdvwarsnac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb2hrZm9ucGlmZHZ3YXJzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTAwNjcsImV4cCI6MjA4NDQ2NjA2N30.uqCcZflkUESMQVGfMnkK5fsf3pEiksKJImnnPtaZ3iQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("Testing getProductsByCategory logic...");
    const slug = 'groceries';

    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories!inner (name, slug),
            subcategories (name),
            special_categories (name)
        `)
        .eq('categories.slug', slug)
        .order('id');

    if (error) {
        console.error("ERROR:", error);
    } else {
        console.log("SUCCESS. Rows:", data.length);
        if (data.length > 0) {
            console.log("Sample Row:", JSON.stringify(data[0], null, 2));
        }
    }
}

test();
