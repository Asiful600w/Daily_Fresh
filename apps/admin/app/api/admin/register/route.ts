import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

        // Check if email is already in use
        const { data: existingUser } = await supabaseAdmin
            .from('User')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered.' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user into User table with MERCHANT role
        const { data: newUser, error: insertError } = await supabaseAdmin
            .from('User')
            .insert({
                name: full_name,
                email: email,
                passwordHash: passwordHash,
                role: 'MERCHANT',
                shopName: shop_name || null,
                phone: phone || null,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .select('id')
            .single();

        if (insertError) {
            console.error('DB Insert Error:', insertError);
            return NextResponse.json(
                { error: 'Failed to create account. Please try again.' },
                { status: 500 }
            );
        }

        // If shop_name or phone provided, we could store in a separate merchant_profiles table
        // For now, we'll rely on the basic User table fields
        // TODO: Consider adding shop_name, phone columns to User table or a separate merchants table

        return NextResponse.json(
            {
                message: 'Registration successful! You can now log in.',
                userId: newUser?.id
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
