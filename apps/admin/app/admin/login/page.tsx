
"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { LoginSchema } from "@/schemas"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    useTheme()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [showTwoFactor] = useState(false)

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
            code: "",
        },
    })


    const router = useRouter()
    const supabase = createClient()

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("")
        setSuccess("")

        startTransition(async () => {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            })

            if (authError) {
                setError(authError.message)
                return
            }

            // Check user role from public.User table
            if (data.user) {
                const { data: profile } = await supabase
                    .from('User')
                    .select('role')
                    .eq('id', data.user.id)
                    .single()

                // Only allow MERCHANT and SUPERADMIN roles to login to admin panel
                if (profile && profile.role !== 'MERCHANT' && profile.role !== 'SUPERADMIN') {
                    await supabase.auth.signOut()
                    setError('This account is not authorized to access the admin panel. Please use the customer portal.')
                    return
                }
            }

            setSuccess("Login successful!")
            router.refresh()
            router.push('/admin')
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100 dark:border-slate-700">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                    <p className="text-gray-500 dark:text-gray-400">Sign in to your admin dashboard</p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {!showTwoFactor && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                                <input
                                    {...form.register("email")}
                                    type="email"
                                    disabled={isPending}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                                    placeholder="admin@example.com"
                                />
                                {form.formState.errors.email && (
                                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
                                <input
                                    {...form.register("password")}
                                    type="password"
                                    disabled={isPending}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                                    placeholder="••••••••"
                                />
                                {form.formState.errors.password && (
                                    <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                                )}
                            </div>
                        </>
                    )}

                    {showTwoFactor && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Two Factor Code</label>
                            <input
                                {...form.register("code")}
                                disabled={isPending}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-center tracking-widest text-lg"
                                placeholder="123456"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50/50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-emerald-50/50 border border-emerald-200 text-emerald-600 rounded-lg text-sm text-center">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? "Authenticating..." : showTwoFactor ? "Confirm" : "Sign In"}
                    </button>
                </form>

                <div className="text-center pt-4 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Want to become a merchant?{' '}
                        <Link href="/admin/register" className="text-primary hover:underline font-medium">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
