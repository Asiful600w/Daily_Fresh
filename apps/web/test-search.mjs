import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vaohkfonpifdvwarsnac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb2hrZm9ucGlmZHZ3YXJzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTAwNjcsImV4cCI6MjA4NDQ2NjA2N30.uqCcZflkUESMQVGfMnkK5fsf3pEiksKJImnnPtaZ3iQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearch(query) {
    console.log(`Searching for: ${query}...`);
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories (name),
            special_categories (name),
            subcategories (name)
        `)
        .eq('is_deleted', false)
        .ilike('name', `%${query}%`)
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Results count:', data.length);
    if (data.length > 0) {
        console.log('First result keys:', Object.keys(data[0]));
        console.log('First result categories:', data[0].categories);
        console.log('First result subcategories:', data[0].subcategories);
    }
}

testSearch('f');
