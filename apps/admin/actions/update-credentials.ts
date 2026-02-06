"use server"

import * as z from "zod"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { auth } from "@/auth"

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
    const session = await auth()

    if (!session?.user?.id) {
        return { error: "Not authenticated" }
    }

    // Verify the user is a SUPERADMIN
    const { data: user, error: userError } = await supabaseAdmin
        .from('User')
        .select('id, email, passwordHash, role')
        .eq('id', session.user.id)
        .single()

    if (userError || !user) {
        return { error: "User not found" }
    }

    if (user.role !== 'SUPERADMIN') {
        return { error: "Only superadmin can update these credentials" }
    }

    // Verify current password
    const passwordsMatch = await bcrypt.compare(values.currentPassword, user.passwordHash || '')
    if (!passwordsMatch) {
        return { error: "Current password is incorrect" }
    }

    // Build update object
    const updates: { email?: string; passwordHash?: string; updatedAt: string } = {
        updatedAt: new Date().toISOString()
    }

    if (values.newEmail && values.newEmail !== user.email) {
        // Check if email is already in use
        const { data: existingUser } = await supabaseAdmin
            .from('User')
            .select('id')
            .eq('email', values.newEmail)
            .neq('id', user.id)
            .single()

        if (existingUser) {
            return { error: "Email is already in use" }
        }
        updates.email = values.newEmail
    }

    if (values.newPassword) {
        updates.passwordHash = await bcrypt.hash(values.newPassword, 10)
    }

    // Apply updates
    const { error: updateError } = await supabaseAdmin
        .from('User')
        .update(updates)
        .eq('id', user.id)

    if (updateError) {
        console.error('Update error:', updateError)
        return { error: "Failed to update credentials" }
    }

    return {
        success: "Credentials updated successfully. Please log out and log back in with your new credentials."
    }
}
