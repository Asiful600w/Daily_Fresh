'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            const redirectUrl = searchParams.get('redirect') || '/';
            router.push(redirectUrl);
            router.refresh();
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: 'https://daily-fresh-web.vercel.app/auth/callback',
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#fafafa] dark:bg-[#111827]">
            {/* Left Panel: Hero Visuals (Hidden on Mobile) */}
            <div className="hidden lg:flex w-full lg:w-1/2 bg-[#26d980]/5 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-90 transition-transform duration-[20s] hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>

                <div className="relative z-10 max-w-lg text-white space-y-8 p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="size-12 bg-[#26d980] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#26d980]/30 backdrop-blur-md">
                            <span className="material-icons-round text-3xl">eco</span>
                        </div>
                        <span className="text-3xl font-bold tracking-tight">Daily Fresh</span>
                    </div>
                    <h1 className="text-6xl font-extrabold leading-tight tracking-tight drop-shadow-lg">
                        Fresh groceries,<br />
                        <span className="text-[#26d980]">delivered daily.</span>
                    </h1>
                    <p className="text-xl font-medium text-white/90 leading-relaxed max-w-md drop-shadow-md">
                        Experience the convenience of farm-fresh produce delivered securely to your doorstep within minutes.
                    </p>

                    {/* Trust Badge */}
                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`size-10 rounded-full border-2 border-[#1f2e24] bg-gray-200 bg-[url('https://i.pravatar.cc/100?img=${i + 10}')] bg-cover`}></div>
                            ))}
                        </div>
                        <div className="text-sm font-semibold">
                            <span className="text-[#26d980]">50k+</span> happy customers
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Login Form */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-24">
                <div className="w-full max-w-[460px] space-y-8 animate-fade-in-up">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-base">Please enter your details to sign in.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-medium p-4 rounded-xl border border-red-100 dark:border-red-900/20 flex items-center gap-2">
                            <span className="material-icons-round text-lg">error_outline</span>
                            {error}
                        </div>
                    )}

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => alert('Google login coming soon')}
                            className="flex items-center justify-center gap-2 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl opacity-60 cursor-not-allowed transition-all"
                        >
                            <Image src="https://www.svgrepo.com/show/475656/google-color.svg" width={20} height={20} className="grayscale" alt="Google" />
                            <span className="font-bold text-slate-500 text-sm">Coming Soon</span>
                            <span className="material-icons-round text-xs text-slate-400">lock</span>
                        </button>
                        <button
                            onClick={() => alert('Facebook login coming soon')}
                            className="flex items-center justify-center gap-2 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl opacity-60 cursor-not-allowed transition-all"
                        >
                            <Image src="https://www.svgrepo.com/show/475647/facebook-color.svg" width={20} height={20} className="grayscale" alt="Facebook" />
                            <span className="font-bold text-slate-500 text-sm">Coming Soon</span>
                            <span className="material-icons-round text-xs text-slate-400">lock</span>
                        </button>
                    </div>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                        <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">or continue with email</span>
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
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
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-sm font-bold text-slate-900 dark:text-white">Password</label>
                                    <Link className="text-primary hover:text-primary-dark text-sm font-bold hover:underline" href="/forgot-password">Forgot Password?</Link>
                                </div>
                                <input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-14 px-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                    placeholder="••••••••"
                                    type="password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-1">
                            <div className="relative flex items-center">
                                <input
                                    className="peer size-5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-primary checked:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                                    id="remember"
                                    type="checkbox"
                                />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transform scale-50 peer-checked:scale-100 transition-all material-icons-round text-sm font-bold">check</span>
                            </div>
                            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none" htmlFor="remember">Remember me for 30 days</label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <>
                                    <span className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    <span>Signing In...</span>
                                </>
                            ) : (
                                <span>Sign In to Account</span>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Don&apos;t have an account?
                            <Link className="text-primary font-bold hover:text-primary-dark hover:underline ml-1 transition-colors" href="/signup">Sign up for free</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
