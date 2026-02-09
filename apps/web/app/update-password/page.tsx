'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
    const [supabase] = useState(() => createClient());
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Ensure we have a session (user clicked the email link)
    useEffect(() => {
        supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
            const session = data?.session;
            if (!session) {
                // If no session, they might have accessed this page directly without the link
                setError("Invalid or expired session. Please request a new password reset link.");
            }
        });
    }, [supabase]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            alert("Password updated successfully!");
            router.push('/'); // Redirect to home/login
        }
    };

    return (
        <div className="flex min-h-screen bg-[#fafafa] dark:bg-[#111827] items-center justify-center p-6">
            <div className="w-full max-w-md bg-white dark:bg-[#10221c] p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-[#1e3a31] animate-fade-in-up">

                <div className="text-center mb-8">
                    <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                        <span className="material-icons-round text-4xl">key</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Set New Password</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Create a strong password that you haven't used before.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-medium p-4 rounded-xl border border-red-100 dark:border-red-900/20 flex items-center gap-2">
                        <span className="material-icons-round text-lg">error_outline</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">New Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-14 px-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                            placeholder="••••••••"
                            type="password"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Confirm New Password</label>
                        <input
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full h-14 px-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                            placeholder="••••••••"
                            type="password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
