import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is SUPERADMIN via public.User table (or metadata if we sync it)
        // Using valid RLS policies or simple query here since we are in an API route.
        // Actually, we can use supabaseAdmin to bypass RLS for the check if needed,
        // or just use the user's client if RLS allows reading own role (it should).
        const { data: profile } = await supabaseAdmin
            .from('User')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('User')
            .select('id, name, email, role, status, shopName, phone, createdAt') // Updated to camelCase if that's what DB uses? 
            // Wait, in previous steps I saw mixed casing usage.
            // AdminAuthContext uses: select('role, name, shopName, id, email')
            // This file used: select('..., shop_name, ... created_at')
            // I should check the DB schema or use `shopName` as per context usage.
            // Code in AdminAuthContext: `shop_name: profile.shopName` suggests DB column is `shopName`.
            // But verify: execute_sql output showed `shopName` in `public.User`.
            // created_at is `createdAt` in output from execute_sql (camelCase).
            // "createdAt":"2026-02-07 06:22:27.267"
            .in('role', ['MERCHANT'])
            .order('createdAt', { ascending: false });

        if (error) {
            console.error('Supabase error fetching merchants:', error);
            throw error;
        }

        // Transform
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
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabaseAdmin
            .from('User')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'SUPERADMIN') {
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
