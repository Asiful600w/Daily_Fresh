'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function loginWeb(
    prevState: { error?: string; success?: boolean },
    formData: FormData
) {
    const rawData = Object.fromEntries(formData.entries());

    const email = rawData.email as string;
    const password = rawData.password as string;
    const rememberMe = rawData.rememberMe === 'on';

    const validatedFields = LoginSchema.safeParse({
        email,
        password,
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
                name: 'web-auth-token',
            },
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            const newOptions: CookieOptions = {
                                ...options,
                                maxAge: rememberMe ? 31536000 : undefined, // 1 year if remember me
                                httpOnly: false, // Critical for client SDK sync
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'lax',
                                path: '/',
                            };
                            cookieStore.set(name, value, newOptions)
                        })
                    } catch {
                        // The `setAll` method was called from a Server Component.
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

        if (profile && profile.role !== 'CUSTOMER') {
            await supabase.auth.signOut();
            return { error: 'Account not authorized for web access' };
        }
    }

    return { success: true };
}

export async function signOutWeb() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                name: 'web-auth-token',
            },
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    );

    await supabase.auth.signOut();
    // redirect('/'); // Let client handle hard navigation to avoid stuck loading states
    return { success: true };
}
