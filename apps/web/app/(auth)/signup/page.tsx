'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignupPage() {
    const router = useRouter();
    // ...
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // const [loading, setLoading] = useState(false); // Removed
    const [error, setError] = useState<string | null>(null);



    // ... inside component

    const [isPending, startTransition] = useTransition();


    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
            setError("Please enter a valid 11-digit mobile number (e.g. 01712345678)");
            return;
        }
        const formattedPhone = `+88${cleanPhone}`;

        startTransition(async () => {
            const supabase = createClient();

            // Check if email already exists in public.User table
            const { data: existingUser } = await supabase
                .from('User')
                .select('email, role')
                .eq('email', email)
                .single();

            if (existingUser) {
                if (existingUser.role === 'MERCHANT' || existingUser.role === 'SUPERADMIN') {
                    setError('This email is already registered as a merchant or admin account. Please use a different email.');
                } else {
                    setError('This email is already registered. Please login instead.');
                }
                return;
            }

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: formattedPhone,
                        role: 'CUSTOMER',
                    }
                }
            });

            if (signUpError) {
                setError(signUpError.message);
                return;
            }

            if (data?.user) {
                alert('Registration successful! Check your email for confirmation or log in.');
                router.push('/login');
            }
        });
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
                        <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">or sign up with email</span>
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    </div>

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
                            <div className="flex w-full h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden">
                                <div className="flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-700/50 border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold select-none">
                                    <span className="mr-2 text-xl">🇧🇩</span>
                                    <span>+88</span>
                                </div>
                                <input
                                    value={phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 11) setPhone(val);
                                    }}
                                    className="flex-1 px-5 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 font-medium outline-none"
                                    placeholder="01712345678"
                                    type="tel"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-14 px-5 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                        placeholder="••••••••"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                    >
                                        <span className="material-icons-round text-xl">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Confirm</label>
                                <div className="relative">
                                    <input
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full h-14 px-5 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                        placeholder="••••••••"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                    >
                                        <span className="material-icons-round text-xl">
                                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
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
                                I agree to the <Link className="text-primary font-bold hover:underline" href="/terms">Terms and Conditions</Link> and <Link className="text-primary font-bold hover:underline" href="/privacy">Privacy Policy</Link>.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isPending ? (
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
