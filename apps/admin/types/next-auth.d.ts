import NextAuth, { DefaultSession } from "next-auth"

export type UserRole = "ADMIN" | "MERCHANT" | "CUSTOMER" | "SUPERADMIN"

declare module "next-auth" {
    interface Session {
        user: {
            role: UserRole
            id: string
        } & DefaultSession["user"]
    }

    interface User {
        role: UserRole
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: UserRole
        id: string
    }
}
