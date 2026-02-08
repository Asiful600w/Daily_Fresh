import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                name: 'admin-auth-token',
            },
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if expired
    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes check
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const isPublicAdminRoute = request.nextUrl.pathname === '/admin/login' ||
        request.nextUrl.pathname === '/admin/register'

    if (isAdminRoute && !isPublicAdminRoute && !user) {
        const redirectUrl = new URL('/admin/login', request.url)
        const redirectResponse = NextResponse.redirect(redirectUrl)

        // Copy cookies from response to redirectResponse
        response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })

        return redirectResponse
    }

    if (isPublicAdminRoute && user) {
        const redirectUrl = new URL('/admin', request.url)
        const redirectResponse = NextResponse.redirect(redirectUrl)

        // Copy cookies from response to redirectResponse
        response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })

        return redirectResponse
    }

    return response
}
