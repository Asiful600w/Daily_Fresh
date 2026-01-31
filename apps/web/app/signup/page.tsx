'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        // Phone Validation (Bangladeshi)
        let formattedPhone = phone.trim();
        // Remove spaces/dashes
        formattedPhone = formattedPhone.replace(/[\s-]/g, '');

        const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
        const match = formattedPhone.match(bdPhoneRegex);

        if (!match && phone.length > 0) {
            setError("Please enter a valid Bangladeshi phone number (e.g. 01700000000)");
            setLoading(false);
            return;
        }

        if (match) {
            // Ensure +88 prefix
            if (!formattedPhone.startsWith('+88')) {
                if (formattedPhone.startsWith('88')) {
                    formattedPhone = '+' + formattedPhone;
                } else {
                    formattedPhone = '+88' + formattedPhone;
                }
            }
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: formattedPhone, // Use formatted phone
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/');
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#fafafa] dark:bg-[#111827]">
            {/* Left Panel: Hero Visuals (Hidden on Mobile) */}
            <div className="hidden lg:flex w-full lg:w-5/12 bg-primary/5 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1595855709915-3931ec628fb6?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-90 transition-transform duration-[20s] hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>

                <div className="relative z-10 w-full max-w-lg text-white space-y-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="size-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30 backdrop-blur-md">
                            <span className="material-icons-round text-3xl">eco</span>
                        </div>
                        <span className="text-3xl font-bold tracking-tight">Daily Fresh</span>
                    </div>

                    <h1 className="text-5xl font-extrabold leading-tight tracking-tight drop-shadow-lg">
                        Eat fresh,<br />
                        <span className="text-primary">live healthy.</span>
                    </h1>
                    <p className="text-lg text-white/80 leading-relaxed max-w-md drop-shadow-md">
                        Join over 50,000 households enjoying farm-fresh produce delivered daily. Start your journey to better eating today.
                    </p>

                    <div className="grid grid-cols-2 gap-6 pt-8">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                            <span className="material-icons-round text-primary text-2xl mb-2">verified_user</span>
                            <p className="font-bold text-sm">Quality<br />Guaranteed</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                            <span className="material-icons-round text-primary text-2xl mb-2">schedule</span>
                            <p className="font-bold text-sm">60-Min<br />Delivery</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Signup Form */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-24 overflow-y-auto">
                <div className="w-full max-w-[480px] space-y-8 animate-fade-in-up">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Create Account</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-base">Sign up to get started with Daily Fresh.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-medium p-4 rounded-xl border border-red-100 dark:border-red-900/20 flex items-center gap-2">
                            <span className="material-icons-round text-lg">error_outline</span>
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSignup}>
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Full Name</label>
                            <input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full h-14 px-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                placeholder="Jane Doe"
                                type="text"
                                required
                            />
                        </div>

                        {/* Email */}
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

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Phone Number</label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full h-14 px-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                placeholder="+1 (555) 000-0000"
                                type="tel"
                            />
                        </div>

                        {/* Password Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Password</label>
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
                                <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Confirm</label>
                                <input
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full h-14 px-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                    placeholder="••••••••"
                                    type="password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3 py-2">
                            <div className="relative flex items-center mt-1">
                                <input
                                    className="peer size-5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-primary checked:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                                    id="terms"
                                    type="checkbox"
                                    required
                                />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transform scale-50 peer-checked:scale-100 transition-all material-icons-round text-sm font-bold">check</span>
                            </div>
                            <label className="text-sm leading-relaxed text-slate-500 dark:text-slate-400" htmlFor="terms">
                                I agree to the <a className="text-primary font-bold hover:underline" href="#">Terms and Conditions</a> and <a className="text-primary font-bold hover:underline" href="#">Privacy Policy</a>.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <>
                                    <span className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <span>Create Account</span>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700/50 mt-8">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Already have an account?
                            <Link className="text-primary font-bold hover:text-primary-dark hover:underline ml-1 transition-colors" href="/login">Log In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
