import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                name: 'web-auth-token',
            },
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    )

    await supabase.auth.signOut()

    // Create response FIRST so we can attach cookies to it
    const response = NextResponse.redirect(new URL('/', request.url), {
        status: 302,
    })

    // NUCLEAR OPTION: Clear ALL cookies and disable caching indiscriminately
    const allCookies = cookieStore.getAll();
    allCookies.forEach((cookie) => {
        // Delete from store (request)
        cookieStore.delete(cookie.name);
        // Delete from response
        response.cookies.delete(cookie.name);
        // Force expire
        response.cookies.set(cookie.name, '', { maxAge: 0, expires: new Date(0) });
    });

    // Disable caching completely
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
}
