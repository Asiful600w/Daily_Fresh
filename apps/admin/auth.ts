
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { authenticator } from "@otplib/preset-default"
import prisma from "@/lib/prisma"

async function getUserByEmail(email: string) {
    try {
        return await prisma.user.findUnique({ where: { email } })
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

                    if (!user || !user.passwordHash) return null // User not found

                    // CHECK LOCKOUT
                    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
                        throw new Error("Account locked. Try again later.")
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.passwordHash)

                    if (passwordsMatch) {
                        // SUCCESSFUL PASSWORD CHECK

                        // 2FA CHECK
                        if (user.isTwoFactorEnabled) {
                            if (!code) {
                                // Tell client 2FA is needed
                                // We can't return a partial session, so we throw a specific error
                                throw new Error("2FA_REQUIRED")
                            }

                            // Verify Code
                            // Assuming twoFactorSecret is stored as plain string for this demo, 
                            // in production verify if it's encrypted.
                            const isValidToken = authenticator.check(code, user.twoFactorSecret || '')

                            if (!isValidToken) {
                                // Log failed attempt (optional here, but good for fortress)
                                throw new Error("Invalid 2FA Code")
                            }
                        }

                        // RESET FAILURES ON SUCCESS
                        try {
                            await prisma.user.update({
                                where: { id: user.id },
                                data: { failedLoginAttempts: 0, lockoutUntil: null },
                            })

                            // AUDIT LOG
                            await prisma.auditLog.create({
                                data: {
                                    userId: user.id,
                                    action: "LOGIN_SUCCESS",
                                    // ipAddress and userAgent would need to be passed from action or headers
                                }
                            })
                        } catch (e) {
                            console.error("Failed to update user stats", e)
                        }

                        return user
                    }

                    // FAILED LOGIN
                    // Increment failed attempts
                    const attempts = user.failedLoginAttempts + 1
                    let lockout = user.lockoutUntil

                    if (attempts >= 5) {
                        lockout = new Date(Date.now() + 30 * 60 * 1000) // 30 mins
                    }

                    await prisma.user.update({
                        where: { id: user.id },
                        data: { failedLoginAttempts: attempts, lockoutUntil: lockout }
                    })

                    await prisma.auditLog.create({
                        data: {
                            userId: user.id,
                            action: "LOGIN_FAILED",
                        }
                    })

                    // console.log("Invalid credentials")
                    return null
                }

                // console.log("Invalid credentials structure")
                return null
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as "ADMIN" | "MERCHANT"
                session.user.id = token.id as string
            }
            return session
        }
    }
})
