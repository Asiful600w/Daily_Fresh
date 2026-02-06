
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { authenticator } from "@otplib/preset-default"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

async function getUserByEmail(email: string) {
    console.log("[AUTH DEBUG] getUserByEmail called with:", email)
    try {
        const { data, error } = await supabaseAdmin
            .from('User')
            .select('*')
            .eq('email', email)
            .single()

        if (error) {
            console.log("[AUTH DEBUG] getUserByEmail error:", error)
            return null
        }
        console.log("[AUTH DEBUG] getUserByEmail found user:", data?.id, data?.email, data?.role)
        return data
    } catch (e) {
        console.log("[AUTH DEBUG] getUserByEmail exception:", e)
        return null
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log("[AUTH DEBUG] authorize called with credentials")
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6), code: z.string().optional() })
                    .safeParse(credentials)

                if (parsedCredentials.success) {
                    const { email, password, code } = parsedCredentials.data
                    console.log("[AUTH DEBUG] Credentials parsed for email:", email)

                    const user = await getUserByEmail(email)

                    if (!user || !user.passwordHash) {
                        console.log("[AUTH DEBUG] User not found or no password hash")
                        return null // User not found
                    }

                    // CHECK LOCKOUT
                    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
                        console.log("[AUTH DEBUG] Account is locked")
                        throw new Error("Account locked. Try again later.")
                    }

                    console.log("[AUTH DEBUG] Comparing passwords...")
                    const passwordsMatch = await bcrypt.compare(password, user.passwordHash)
                    console.log("[AUTH DEBUG] Passwords match:", passwordsMatch)

                    if (passwordsMatch) {
                        // SUCCESSFUL PASSWORD CHECK
                        console.log("[AUTH DEBUG] Password verified successfully")

                        // 2FA CHECK
                        if (user.isTwoFactorEnabled) {
                            if (!code) {
                                throw new Error("2FA_REQUIRED")
                            }

                            const isValidToken = authenticator.check(code, user.twoFactorSecret || '')

                            if (!isValidToken) {
                                throw new Error("Invalid 2FA Code")
                            }
                        }

                        // RESET FAILURES ON SUCCESS
                        try {
                            await supabaseAdmin
                                .from('User')
                                .update({ failedLoginAttempts: 0, lockoutUntil: null })
                                .eq('id', user.id)

                            // AUDIT LOG
                            await supabaseAdmin.from('AuditLog').insert({
                                userId: user.id,
                                action: "LOGIN_SUCCESS",
                                createdAt: new Date().toISOString()
                            })
                        } catch (e) {
                            console.error("Failed to update user stats", e)
                        }

                        console.log("[AUTH DEBUG] Returning user object:", { id: user.id, email: user.email, role: user.role })
                        return user
                    }

                    // FAILED LOGIN
                    console.log("[AUTH DEBUG] Password mismatch, incrementing failed attempts")
                    const attempts = (user.failedLoginAttempts || 0) + 1
                    let lockout = user.lockoutUntil

                    if (attempts >= 5) {
                        lockout = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 mins
                    }

                    await supabaseAdmin
                        .from('User')
                        .update({ failedLoginAttempts: attempts, lockoutUntil: lockout })
                        .eq('id', user.id)

                    await supabaseAdmin.from('AuditLog').insert({
                        userId: user.id,
                        action: "LOGIN_FAILED",
                        createdAt: new Date().toISOString()
                    })

                    return null
                }
                console.log("[AUTH DEBUG] Credentials parsing failed")
                return null
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            console.log("[AUTH DEBUG] jwt callback - user:", user ? { id: user.id, role: user.role } : "none")
            if (user) {
                token.role = user.role
                token.id = user.id
            }
            console.log("[AUTH DEBUG] jwt callback - token:", { id: token.id, role: token.role })
            return token
        },
        async session({ session, token }) {
            console.log("[AUTH DEBUG] session callback - token:", { id: token.id, role: token.role })
            if (token && session.user) {
                session.user.role = token.role as "ADMIN" | "MERCHANT" | "SUPERADMIN"
                session.user.id = token.id as string
            }
            console.log("[AUTH DEBUG] session callback - session.user:", session.user)
            return session
        }
    }
})
