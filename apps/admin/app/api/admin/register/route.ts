import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabaseService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, full_name, phone } = body;

        if (!email || !password || !full_name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabaseService = getSupabaseService();

        // 1. Create the user in Supabase Auth
        // Using admin.createUser allows us to set metadata trusted
        const { data: userData, error: userError } = await supabaseService.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name,
                phone,
                role: 'merchant'
            }
        });

        if (userError) {
            if (userError.message.includes('already registered')) {
                return NextResponse.json(
                    { error: 'Email already registered.' },
                    { status: 409 }
                );
            }
            throw userError;
        }

        if (!userData.user) {
            throw new Error('Failed to create user');
        }

        // 2. Insert into public.admins table
        // This insert works because supabaseService bypasses RLS
        const { error: dbError } = await supabaseService
            .from('admins')
            .insert({
                id: userData.user.id,
                email: email,
                full_name: full_name,
                phone: phone,
                role: 'merchant',
                shop_name: body.shop_name,
                status: 'pending' // Default status
            });

        if (dbError) {
            console.error('DB Insert Error:', dbError);
            // Cleanup auth user if DB insert fails
            await supabaseService.auth.admin.deleteUser(userData.user.id);
            throw new Error('Failed to create admin profile. Database error.');
        }

        return NextResponse.json(
            { message: 'Registration successful. Account pending approval.' },
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
