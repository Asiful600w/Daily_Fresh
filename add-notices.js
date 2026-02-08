// Test script to add notices via API
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vaohkfonpifdvwarsnac.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb2hrZm9ucGlmZHZ3YXJzbmFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg5MDA2NywiZXhwIjoyMDg0NDY2MDY3fQ.Xh7zAH_zN9uH6nFjBV_lVtFWUqA_92pDCx0CkwIJJ5Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addNotices() {
    console.log('Adding sample notices...\n');

    const notices = [
        { text: '🎉 Welcome to Daily Fresh! Get 20% off on your first order!', active: true },
        { text: '🚚 Free delivery on orders above ৳500', active: true },
        { text: '🌿 Fresh organic vegetables delivered daily', active: true },
        { text: '⏰ Order before 6 PM for same-day delivery', active: true },
        { text: '💚 100% Fresh Guarantee - Money back if not satisfied', active: true }
    ];

    const { data, error } = await supabase
        .from('notices')
        .insert(notices)
        .select();

    if (error) {
        console.error('❌ Error adding notices:', error);
    } else {
        console.log(`✅ Added ${data.length} notices successfully!`);
        console.log('\nNotices:');
        data.forEach((notice, i) => {
            console.log(`${i + 1}. ${notice.text}`);
        });
    }

    // Verify by fetching
    console.log('\n\nVerifying notices...');
    const { data: allNotices, error: fetchError } = await supabase
        .from('notices')
        .select('*')
        .eq('active', true);

    if (fetchError) {
        console.error('❌ Error fetching notices:', fetchError);
    } else {
        console.log(`✅ Found ${allNotices.length} active notices in database`);
    }
}

addNotices();
