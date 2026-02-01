import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabaseService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, email } = body;
        console.log('Admin Verify Request:', { userId, email }); // Debug log

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const supabaseService = getSupabaseService();

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
