import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    try {
        const supabase = await createClient();

        // Optional: Check user session for debugging, but RLS handles actual permissions
        // const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                categories (name),
                special_categories (name),
                subcategories (name)
            `)
            .eq('is_deleted', false)
            .ilike('name', `%${query}%`)
            .limit(5);

        if (error) {
            console.error('Search API Error:', JSON.stringify(error, null, 2));
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data || [] });

    } catch (err: any) {
        console.error('Search API Exception:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
