
"use server"

import * as z from "zod"
import { signIn } from "@/auth"
import { LoginSchema } from "@/schemas"
import { AuthError } from "next-auth"
import { isRedirectError } from "next/dist/client/components/redirect-error"

// Simple in-memory rate limiter for demo purpose
// In production effectively use Redis (Upstash)
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();

function checkRateLimit(ip: string) {
    const now = Date.now();
    const window = 60 * 1000; // 1 minute
    const limit = 10;

    const record = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - record.lastReset > window) {
        record.count = 0;
        record.lastReset = now;
    }

    if (record.count >= limit) {
        return false;
    }

    record.count++;
    rateLimitMap.set(ip, record);
    return true;
}

export const login = async (values: z.infer<typeof LoginSchema>, ipAddress: string) => {
    // 1. Rate Limit
    if (!checkRateLimit(ipAddress)) {
        return { error: "Too many requests. Please try again later." }
    }

    // 2. Validate Fields
    const validatedFields = LoginSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: "Invalid fields!" }
    }

    const { email, password, code } = validatedFields.data;

    try {
        await signIn("credentials", {
            email,
            password,
            code,
            redirectTo: "/admin", // Default redirect
        })
    } catch (error) {
        // NextAuth v5 throws a NEXT_REDIRECT error on successful login
        // We must re-throw this error to allow the redirect to happen
        if (isRedirectError(error)) {
            throw error;
        }

        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials!" }
                case "CallbackRouteError":
                    // We threw specific errors in auth.ts, check cause
                    // But NextAuth wraps it.
                    const msg = error.cause?.err?.message;
                    if (msg === "2FA_REQUIRED") return { error: "2FA_REQUIRED" };
                    if (msg === "Account locked. Try again later.") return { error: msg };
                    if (msg === "Invalid 2FA Code") return { error: "Invalid 2FA Code" };
                    return { error: "Something went wrong!" }
                default:
                    return { error: "Something went wrong!" }
            }
        }
        throw error;
    }

    return { success: "Login Successful!" }
}
