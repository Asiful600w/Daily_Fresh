
"use server"

import * as z from "zod"
import bcrypt from "bcryptjs"
import { RegisterSchema } from "@/schemas"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: "Invalid fields!" }
    }

    const { email, password, name } = validatedFields.data
    const hashedPassword = await bcrypt.hash(password, 10)

    const { data: existingUser } = await supabaseAdmin
        .from('User')
        .select('email')
        .eq('email', email)
        .single()

    if (existingUser) {
        return { error: "Email already in use!" }
    }

    const { error } = await supabaseAdmin.from('User').insert({
        name,
        email,
        passwordHash: hashedPassword,
        role: "MERCHANT",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    })

    if (error) {
        return { error: "Failed to create user" }
    }

    return { success: "User created!" }
}
