
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vaohkfonpifdvwarsnac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb2hrZm9ucGlmZHZ3YXJzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTAwNjcsImV4cCI6MjA4NDQ2NjA2N30.uqCcZflkUESMQVGfMnkK5fsf3pEiksKJImnnPtaZ3iQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("Testing Supabase data fetch...");
    try {
        const { data, error } = await supabase
            .from('categories')
            .select(`id, name, slug, image_url`)
            .limit(1);

        if (error) {
            console.error("Supabase Error:", error);
        } else {
            console.log("Supabase Data:", data);
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

testConnection();
