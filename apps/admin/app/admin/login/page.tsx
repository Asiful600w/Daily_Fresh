
"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { LoginSchema } from "@/schemas"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useAdminAuth } from "@/context/AdminAuthContext"

// ... imports

import { loginAdmin } from "@/actions/auth"

export default function LoginPage() {
    useTheme()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [showTwoFactor] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const { adminUser, adminLoading } = useAdminAuth()

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
            code: "",
        },
    })


    const router = useRouter()
    // const supabase = createClient() // No longer needed for login action

    const [isRedirecting, setIsRedirecting] = useState(false)

    // Redirect if already logged in (breaks back-button loop)
    useEffect(() => {
        if (!adminLoading && adminUser) {
            console.log("Already logged in, redirecting to dashboard...");
            setIsRedirecting(true);
            router.replace('/admin');
        }
    }, [adminUser, adminLoading, router]);

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("")
        setSuccess("")

        startTransition(async () => {
            const formData = new FormData()
            formData.append('email', values.email)
            formData.append('password', values.password)
            if (values.code) formData.append('code', values.code)
            if (rememberMe) formData.append('rememberMe', 'on')

            // Call server action
            const result = await loginAdmin({ error: '', success: false }, formData)

            if (result?.error) {
                setError(result.error)
                return
            }

            setSuccess("Login successful!")
            setIsRedirecting(true) // Show full screen loader

            // Force full reload to ensure AdminAuthContext picks up the new cookie from Server Action
            // and to clean browser history stack
            window.location.replace('/admin')
        })
    }

    if (isRedirecting) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 transition-all duration-300">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Authenticating</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Redirecting to your dashboard...</p>
                    </div>
                </div>
            </div>
        )
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
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
                                    <Link href="/admin/forgot-password" className="text-xs font-medium text-primary hover:underline">
                                        Forgot Password?
                                    </Link>
                                </div>
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

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isPending}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 bg-gray-50 dark:bg-slate-900 dark:border-slate-700 cursor-pointer"
                                />
                                <label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none">
                                    Keep me signed in
                                </label>
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
