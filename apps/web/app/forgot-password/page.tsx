'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#fafafa] dark:bg-[#111827] items-center justify-center p-6">
            <div className="w-full max-w-md bg-white dark:bg-[#10221c] p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-[#1e3a31] animate-fade-in-up">

                <div className="text-center mb-8">
                    <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                        <span className="material-icons-round text-4xl">lock_reset</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Forgot Password?</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        No worries, these things happen. Enter your email and we'll send you a link to reset your password.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-medium p-4 rounded-xl border border-red-100 dark:border-red-900/20 flex items-center gap-2">
                        <span className="material-icons-round text-lg">error_outline</span>
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="mb-6 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 text-sm font-medium p-6 rounded-xl border border-green-100 dark:border-green-900/20 text-center">
                        <div className="size-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600 dark:text-green-400">
                            <span className="material-icons-round text-2xl">mark_email_read</span>
                        </div>
                        <p className="mb-2 font-bold text-base">Check your email</p>
                        <p>We've sent a password reset link to <span className="font-bold">{email}</span>.</p>
                        <p className="mt-4 text-xs text-slate-500">Didn't receive it? Check your spam folder.</p>

                        <Link href="/login" className="mt-6 inline-block w-full py-3 bg-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-transparent dark:hover:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Email Address</label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-14 px-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                placeholder="name@example.com"
                                type="email"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? 'Sending Link...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                {!success && (
                    <div className="text-center pt-6 mt-2">
                        <Link href="/login" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                            <span className="material-icons-round text-lg">arrow_back</span>
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
