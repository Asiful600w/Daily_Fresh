import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { auth } from '@/auth';

export async function GET() {
    try {
        // Verify caller is ADMIN or SUPERADMIN
        const session = await auth();
        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('User')
            .select('id, name, email, role, status, shopName, phone, createdAt')
            .in('role', ['MERCHANT', 'ADMIN'])
            .order('createdAt', { ascending: false });

        if (error) {
            console.error('Supabase error fetching merchants:', error);
            throw error;
        }

        if (error) throw error;

        // Transform to match expected format in the UI
        const merchants = (data || []).map((user: any) => ({
            id: user.id,
            email: user.email,
            full_name: user.name,
            shop_name: user.shopName,
            status: user.status || 'approved',
            role: user.role,
            created_at: user.createdAt,
            phone: user.phone
        }));

        return NextResponse.json(merchants);
    } catch (error: any) {
        console.error('Error fetching merchants:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        // Verify caller is ADMIN or SUPERADMIN
        const session = await auth();
        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('User')
            .update({ status, updatedAt: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating merchant status:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
