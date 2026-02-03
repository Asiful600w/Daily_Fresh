
"use server"

import * as z from "zod"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import { RegisterSchema } from "@/schemas"
import prisma from "@/lib/prisma"

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message }
    }

    const { email, password, name } = validatedFields.data

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        })

        if (existingUser) {
            return { error: "Email already in use!" }
        }

        await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                role: "CUSTOMER",
            },
        })

        return { success: "User created!" }
    } catch (error: any) {
        console.error("REGISTRATION ERROR:", error);
        return { error: `Registration Failed: ${error.message}` }
    }
}
