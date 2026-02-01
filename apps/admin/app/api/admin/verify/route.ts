import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase with Service Role Key for Admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Critical: Missing Supabase Env Vars in Verify Route', { url: !!supabaseUrl, key: !!supabaseKey });
}

// WARNING: If this falls back to ANON key, it will still hit RLS. User MUST set SERVICE KEY.
const supabaseService = createClient(supabaseUrl, supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, email } = body;
        console.log('Admin Verify Request:', { userId, email }); // Debug log

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Query admins table using Service Role (bypasses RLS)
        const { data: adminData, error } = await supabaseService
            .from('admins')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            // If row missing
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'User not found in admins table' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json({
            status: adminData.status,
            role: adminData.role,
            shop_name: adminData.shop_name,
            full_name: adminData.full_name,
            phone: adminData.phone,
            id: adminData.id,
            email: adminData.email
        }, { status: 200 });

    } catch (error: any) {
        console.error('Admin Verify API Critical Error:', error);
        return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
    }
}
