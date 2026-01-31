import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// We need the SERVICE ROLE KEY to bypass RLS and create users/rows with specific roles.
// The previous 'supabaseAdmin' used the Anon key, which caused the DB insert to fail silently (or loudly).

const supabaseUrl = 'https://vaohkfonpifdvwarsnac.supabase.co';
// WARNING: REPLACE THIS WITH YOUR ACTUAL SUPABASE SERVICE ROLE KEY (Found in Project Settings > API)
// Do NOT expose this key on the client side.
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'REPLACE_WITH_YOUR_SERVICE_ROLE_KEY';

const supabaseService = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

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
