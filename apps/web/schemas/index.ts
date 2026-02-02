
import * as z from "zod"

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
    password: z.string().min(1, {
        message: "Password is required",
    }),
    code: z.optional(z.string()),
})

export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{12,})/, {
        message: "Password must be at least 12 characters long and contain at least one uppercase letter, one number, and one special character."
    }),
    name: z.string().min(1, {
        message: "Name is required",
    }),
})
