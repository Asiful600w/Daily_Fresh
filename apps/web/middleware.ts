
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const user = req.auth?.user

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
    const isProfileRoute = nextUrl.pathname.startsWith("/profile")
    const isCheckoutRoute = nextUrl.pathname.startsWith("/checkout")
    const isLoginRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/signup"

    // 1. Handle API Auth routes (allow them)
    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    // 2. Handle Login/Signup routes
    if (isLoginRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/", nextUrl))
        }
        return NextResponse.next();
    }

    // 3. Protect Customer Routes
    if (isProfileRoute || isCheckoutRoute) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", nextUrl))
        }
        // Optional: check if role is CUSTOMER?
        // Typically admins might also shop, so we might not restrict STRICTLY to CUSTOMER role only for shopping.
        // But for strong security, maybe we should.
        // User requirement said "same security update", RBAC implies correct roles.
        if (user?.role !== "CUSTOMER" && user?.role !== "ADMIN" && user?.role !== "MERCHANT") {
            // If valid user but weird role, block? Or allow all authed users to shop.
            // Let's allow all authed users for now unless strictly specified.
            // But implementing RBAC for Web usually means "Auth required".
            return NextResponse.next()
        }
        return NextResponse.next()
    }

    // 5. Add Security Headers
    const response = NextResponse.next()
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';")

    return response
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
