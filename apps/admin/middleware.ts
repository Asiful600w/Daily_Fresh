
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const user = req.auth?.user

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
    const isAdminRoute = nextUrl.pathname.startsWith("/admin")
    const isMerchantRoute = nextUrl.pathname.startsWith("/merchant")
    const isPublicDocRoute = nextUrl.pathname.startsWith("/admin/documentation")
    const isRegisterRoute = nextUrl.pathname === "/admin/register"
    const isLoginRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/admin/login"

    // 1. Handle API Auth routes (allow them)
    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    // 2. Handle Login/Public routes
    if (isLoginRoute) {
        if (isLoggedIn) {
            // Redirect logged in users to their dashboard
            if (user?.role === "ADMIN") return NextResponse.redirect(new URL("/admin", nextUrl))
            if (user?.role === "MERCHANT") return NextResponse.redirect(new URL("/merchant", nextUrl))
            return NextResponse.redirect(new URL("/", nextUrl))
        }
        return NextResponse.next();
    }

    // 3. Protect Admin Routes (except public ones like register)
    if (isAdminRoute && !isPublicDocRoute && !isRegisterRoute) {
        if (!isLoggedIn) {
            // Redirect to login if not logged in
            return NextResponse.redirect(new URL("/admin/login", nextUrl))
        }
        if (user?.role !== "ADMIN" && user?.role !== "MERCHANT") {
            // Redirect to 403 if logged in but wrong role
            return NextResponse.rewrite(new URL("/403", nextUrl))
        }
        return NextResponse.next()
    }

    // 4. Protect Merchant Routes
    if (isMerchantRoute) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", nextUrl))
        }
        if (user?.role !== "MERCHANT") {
            return NextResponse.rewrite(new URL("/403", nextUrl))
        }
        return NextResponse.next()
    }

    // 5. Add Security Headers
    // We can attach headers to the response
    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
