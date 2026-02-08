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
                name: 'web-auth-token',
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
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/profile') ||
        request.nextUrl.pathname.startsWith('/checkout')
    const isAuthRoute = request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname === '/signup'

    if (isProtectedRoute && !user) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        const redirectResponse = NextResponse.redirect(redirectUrl)

        // Copy cookies from response to redirectResponse to ensure session is saved
        response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })

        return redirectResponse
    }

    if (isAuthRoute && user) {
        const redirectUrl = new URL('/', request.url)
        const redirectResponse = NextResponse.redirect(redirectUrl)

        // Copy cookies from response to redirectResponse
        response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })

        return redirectResponse
    }

    return response
}
