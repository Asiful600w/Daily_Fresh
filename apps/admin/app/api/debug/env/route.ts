import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

    console.log('[DEBUG] Environment Check:');
    console.log('- URL Present:', !!url);
    console.log('- Service Key Present:', !!serviceKey);
    console.log('- Service Key Length:', serviceKey ? serviceKey.length : 0);

    // Test DB Connection
    const { data, error } = await supabaseAdmin.from('User').select('count').limit(1).single();

    return NextResponse.json({
        env: {
            urlPresent: !!url,
            serviceKeyPresent: !!serviceKey,
            serviceKeyLength: serviceKey ? serviceKey.length : 0
        },
        dbConnection: {
            success: !error,
            error: error
        }
    });
}
