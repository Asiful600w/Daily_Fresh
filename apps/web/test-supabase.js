
import { createClient } from '@supabase/supabase-js';

// Hardcoded for debugging (from .env.local)
const supabaseUrl = 'https://vaohkfonpifdvwarsnac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb2hrZm9ucGlmZHZ3YXJzbmFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg5MDA2NywiZXhwIjoyMDg0NDY2MDY3fQ.Xh7zAH_zN9uH6nFjBV_lVtFWUqA_92pDCx0CkwIJJ5Q';

console.log("Connecting to:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserFetch() {
    console.log("Fetching users from table 'User'...");
    try {
        const { data, error } = await supabase
            .from('User')
            .select('*')
            .limit(5);

        if (error) {
            console.error("Supabase Error:", error);
        } else {
            console.log("Found Users:", data.length);
            if (data.length > 0) {
                console.log("First User Sample:", {
                    id: data[0].id,
                    email: data[0].email,
                    name: data[0].name, // Log the name!
                    role: data[0].role,
                    hasPasswordHash: !!data[0].passwordHash,
                    passwordHashPrefix: data[0].passwordHash ? data[0].passwordHash.substring(0, 10) : 'N/A'
                });
            } else {
                console.log("No users found in table 'User'.");
            }
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

testUserFetch();
