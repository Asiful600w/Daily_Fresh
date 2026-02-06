import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, email } = body;
        console.log('Admin Verify Request:', { userId, email }); // Debug log

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Query User table using Service Role (bypasses RLS)
        const { data: userData, error } = await supabaseAdmin
            .from('User')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            // If row missing
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            console.error('Verify API Error:', error);
            throw error;
        }

        return NextResponse.json({
            status: userData.status || 'approved',
            role: userData.role,
            shop_name: userData.shopName,
            full_name: userData.name,
            phone: userData.phone,
            id: userData.id,
            email: userData.email
        }, { status: 200 });

    } catch (error: any) {
        console.error('Admin Verify API Critical Error:', error);
        return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
    }
}
