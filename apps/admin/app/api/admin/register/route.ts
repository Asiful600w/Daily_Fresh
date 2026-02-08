import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, full_name, phone, shop_name } = body;

        if (!email || !password || !full_name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Confirm email automatically for admin-created users (or pending verification workflow in app)
            user_metadata: {
                full_name,
                role: 'MERCHANT',
                phone: phone,
                shop_name: shop_name,
                avatar_url: null, // Default
            }
        });

        if (error) {
            console.error('Supabase Auth Create Error:', error);
            // Check for specific error codes if needed, e.g. email exists
            if (error.message.includes("already registered") || error.status === 422) { // rough check
                return NextResponse.json({ error: "Email already registered." }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Trigger handles public.User creation.
        // We can return success.

        return NextResponse.json(
            {
                message: 'Registration successful! You can now log in.',
                userId: user?.id
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
