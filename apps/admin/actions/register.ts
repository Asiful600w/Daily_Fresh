"use server"

import * as z from "zod"
import { RegisterSchema } from "@/schemas"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: "Invalid fields!" }
    }

    const { email, password, name } = validatedFields.data

    // Check for existing user in auth.users
    const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingAuthUser.users.some(u => u.email === email)

    if (userExists) {
        return { error: "Email already in use!" }
    }

    // Create user with Supabase Auth (this will trigger handle_new_user)
    const { error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm for admin-created users
        user_metadata: {
            full_name: name,
            role: 'MERCHANT'
        }
    })

    if (error) {
        console.error('Registration error:', error)
        return { error: error.message || "Failed to create user" }
    }

    return { success: "Merchant account created successfully!" }
}
