"use server"

import * as z from "zod"

// TODO: Refactor for Supabase Auth
// import { supabaseAdmin } from "@/lib/supabaseAdmin"
// import { createClient } from "@/lib/supabase/server"

const UpdateCredentialsSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newEmail: z.string().email().optional(),
    newPassword: z.string().min(6, "Password must be at least 6 characters").optional(),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false
    }
    return true
}, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

export const updateSuperadminCredentials = async (values: z.infer<typeof UpdateCredentialsSchema>) => {
    // const supabase = await createClient()
    // const { data: { user } } = await supabase.auth.getUser()

    // if (!user) {
    //     return { error: "Not authenticated" }
    // }

    return {
        error: "Password updates are temporarily disabled during Supabase migration. Please use the Forgot Password flow or contact support.",
        success: undefined
    }
}
