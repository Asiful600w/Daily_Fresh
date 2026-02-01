import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabaseService';

export async function GET(request: Request) {
    try {
        const supabaseService = getSupabaseService();
        const { data, error } = await supabaseService
            .from('admins')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching merchants:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabaseService = getSupabaseService();
        const { error } = await supabaseService
            .from('admins')
            .update({ status })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating merchant status:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
