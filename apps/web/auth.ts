
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { authenticator } from "@otplib/preset-default"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

async function getUserByEmail(email: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('User')
            .select('*')
            .eq('email', email)
            .single()

        if (error) return null
        return data
    } catch {
        return null
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6), code: z.string().optional() })
                    .safeParse(credentials)

                if (parsedCredentials.success) {
                    const { email, password, code } = parsedCredentials.data

                    const user = await getUserByEmail(email)

                    if (!user || !user.passwordHash) {
                        return null // User not found
                    }

                    // CHECK LOCKOUT
                    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
                        throw new Error("Account locked. Try again later.")
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.passwordHash)

                    if (passwordsMatch) {
                        // SUCCESSFUL PASSWORD CHECK

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
                                timestamp: new Date().toISOString()
                            })
                        } catch (e) {
                            console.error("Failed to update user stats", e)
                        }

                        return user
                    }

                    // FAILED LOGIN
                    // Increment failed attempts
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
                        timestamp: new Date().toISOString()
                    })

                    return null
                } else {
                    console.log("AUTH DEBUG: Invalid credentials schema");
                }

                return null
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id
                // Store essential user info in token to persist it across sessions
                token.name = user.name
                token.email = user.email
                // Mock user_metadata for compat with existing frontend that expects Supabase User structure
                token.user_metadata = {
                    full_name: user.name,
                    email: user.email,
                    avatar_url: null, // Add if you have this field
                    phone: (user as any).phone
                }
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as "ADMIN" | "MERCHANT" | "CUSTOMER"
                session.user.id = token.id as string
                session.user.name = token.name as string
                session.user.email = token.email as string

                // Attach the metadata to the user object so the frontend can use it
                // We cast this because NextAuth types don't have user_metadata by default
                (session.user as any).user_metadata = token.user_metadata;
                (session.user as any).phone = (token.user_metadata as any)?.phone;
            }
            return session
        }
    }
})
