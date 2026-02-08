'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { LoginSchema } from '@/schemas';

export async function loginAdmin(
    prevState: { error?: string; success?: boolean },
    formData: FormData
) {
    const rawData = Object.fromEntries(formData.entries());

    // Convert checkbox "on" to boolean true, or false if missing
    // But LoginSchema expects specific fields. 
    // We'll parse manual fields to match schema + rememberMe

    const email = rawData.email as string;
    const password = rawData.password as string;
    const rememberMe = rawData.rememberMe === 'on'; // Checkbox sends 'on'

    const validatedFields = LoginSchema.safeParse({
        email,
        password,
        code: rawData.code, // Handle 2FA if present in schema
    });

    if (!validatedFields.success) {
        return { error: 'Invalid fields' };
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                name: 'admin-auth-token',
            },
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            // Update cookie options based on Remember Me
                            const newOptions: CookieOptions = {
                                ...options,
                                // If rememberMe is true, set maxAge to 1 year (31536000 seconds)
                                // otherwise leave undefined (session cookie)
                                maxAge: rememberMe ? 31536000 : undefined,
                                httpOnly: false, // Allow client-side access
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'lax',
                                path: '/',
                            };
                            cookieStore.set(name, value, newOptions)
                        })
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    if (data.user) {
        // Check role
        const { data: profile } = await supabase
            .from('User')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profile && profile.role !== 'MERCHANT' && profile.role !== 'SUPERADMIN') {
            await supabase.auth.signOut();
            return { error: 'Unauthorized role' };
        }
    }

    return { success: true };
}
