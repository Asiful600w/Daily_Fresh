'use server'

import * as z from "zod"
import { RegisterSchema } from "@/schemas"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message }
    }

    const { email, password, name, phone } = validatedFields.data

    try {
        // Check for existing user in auth.users
        const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers()
        const userExists = existingAuthUser.users.some(u => u.email === email)

        if (userExists) {
            return { error: "Email already in use!" }
        }

        // Create user with Supabase Auth (this will trigger handle_new_user)
        const { error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm for server-side registration
            user_metadata: {
                full_name: name,
                phone: phone,
                role: 'CUSTOMER'
            }
        })

        if (createError) {
            throw new Error(createError.message)
        }

        return { success: "Account created successfully! You can now log in." }
    } catch (error: any) {
        console.error("REGISTRATION ERROR:", error);
        return { error: `Registration Failed: ${error.message}` }
    }
}
