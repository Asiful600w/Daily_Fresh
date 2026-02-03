'use server'

import * as z from "zod"
import bcrypt from "bcryptjs"
import { RegisterSchema } from "@/schemas"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message }
    }

    const { email, password, name } = validatedFields.data

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        // Check for existing user
        const { data: existingUser } = await supabaseAdmin
            .from('User')
            .select('email')
            .eq('email', email)
            .single()

        if (existingUser) {
            return { error: "Email already in use!" }
        }

        // Create new user (Using public.User table as before)
        const { error: createError } = await supabaseAdmin
            .from('User')
            .insert({
                name,
                email,
                passwordHash: hashedPassword,
                role: "CUSTOMER",
                updatedAt: new Date().toISOString()
            })

        if (createError) {
            throw new Error(createError.message)
        }

        return { success: "User created!" }
    } catch (error: any) {
        console.error("REGISTRATION ERROR:", error);
        return { error: `Registration Failed: ${error.message}` }
    }
}
