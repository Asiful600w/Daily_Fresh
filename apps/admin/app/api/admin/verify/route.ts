import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase with Service Role Key for Admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Fallback to placeholder if env not set, but logic handles it
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// WARNING: If this falls back to ANON key, it will still hit RLS. User MUST set SERVICE KEY.
const supabaseService = createClient(supabaseUrl, supabaseKey, {
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
            role: adminData.role
        }, { status: 200 });

    } catch (error: any) {
        console.error('Admin Verify API Critical Error:', error);
        return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
    }
}
