import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    // const cookieStore = cookies();
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(5);

    return NextResponse.json({
        user: user ? user.id : 'No User',
        results: data,
        error: error
    });
}
