
import { auth } from "./auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const user = req.auth?.user

    console.log("[MIDDLEWARE DEBUG] Request path:", nextUrl.pathname)
    console.log("[MIDDLEWARE DEBUG] isLoggedIn:", isLoggedIn)
    console.log("[MIDDLEWARE DEBUG] user role:", user?.role)

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
    const isAdminRoute = nextUrl.pathname.startsWith("/admin")
    const isMerchantRoute = nextUrl.pathname.startsWith("/merchant")
    const isPublicDocRoute = nextUrl.pathname.startsWith("/admin/documentation")
    const isRegisterRoute = nextUrl.pathname === "/admin/register"
    const isLoginRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/admin/login"

    // 1. Handle API Auth routes (allow them)
    if (isApiAuthRoute) {
        console.log("[MIDDLEWARE DEBUG] API auth route - allowing")
        return NextResponse.next();
    }

    // 2. Handle Login/Public routes
    if (isLoginRoute) {
        console.log("[MIDDLEWARE DEBUG] Login route - isLoggedIn:", isLoggedIn)
        if (isLoggedIn) {
            // Redirect logged in users to their dashboard
            console.log("[MIDDLEWARE DEBUG] User is logged in, redirecting from login to dashboard")
            if (user?.role === "SUPERADMIN" || user?.role === "ADMIN") {
                console.log("[MIDDLEWARE DEBUG] Redirecting SUPERADMIN/ADMIN to /admin")
                return NextResponse.redirect(new URL("/admin", nextUrl))
            }
            if (user?.role === "MERCHANT") return NextResponse.redirect(new URL("/merchant", nextUrl))
            return NextResponse.redirect(new URL("/", nextUrl))
        }
        console.log("[MIDDLEWARE DEBUG] Not logged in, showing login page")
        return NextResponse.next();
    }

    // 3. Protect Admin Routes (except public ones like register)
    if (isAdminRoute && !isPublicDocRoute && !isRegisterRoute) {
        console.log("[MIDDLEWARE DEBUG] Protected admin route")
        if (!isLoggedIn) {
            console.log("[MIDDLEWARE DEBUG] Not logged in - redirecting to /admin/login")
            // Redirect to login if not logged in
            return NextResponse.redirect(new URL("/admin/login", nextUrl))
        }
        if (user?.role !== "SUPERADMIN" && user?.role !== "ADMIN" && user?.role !== "MERCHANT") {
            console.log("[MIDDLEWARE DEBUG] Wrong role - showing 403")
            // Redirect to 403 if logged in but wrong role
            return NextResponse.rewrite(new URL("/403", nextUrl))
        }
        console.log("[MIDDLEWARE DEBUG] Access granted to admin route")
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
    console.log("[MIDDLEWARE DEBUG] Default - allowing request")
    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
