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

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Ideally show a verification message or auto-login
            router.push('/');
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row">
            {/* Left Side: Visual Brand Panel */}
            <div className="relative hidden lg:flex lg:w-1/2 xl:w-5/12 bg-[#26d980]/10 items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_#26d980_0%,_transparent_70%)]"></div>
                <div className="relative z-10 w-full max-w-lg">
                    <div className="mb-12 flex items-center gap-3">
                        <div className="size-10 bg-[#26d980] rounded-lg flex items-center justify-center text-white">
                            <span className="material-icons-round text-2xl">eco</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0f1a14] dark:text-white">Daily Fresh</h1>
                    </div>
                    <div className="space-y-8">
                        <h2 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-[#0f1a14] dark:text-white">
                            The garden&apos;s best, <br />
                            <span className="text-[#26d980]">right to your door.</span>
                        </h2>
                        <p className="text-lg text-[#0f1a14]/70 dark:text-white/70 leading-relaxed max-w-md">
                            Join over 50,000 households enjoying farm-fresh produce, organic essentials, and gourmet delights delivered daily.
                        </p>
                        <div className="grid grid-cols-2 gap-6 pt-8">
                            <div className="flex items-center gap-3">
                                <span className="material-icons-round text-[#26d980]">verified_user</span>
                                <span className="text-sm font-medium text-[#0f1a14] dark:text-white">Quality Guaranteed</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-icons-round text-[#26d980]">schedule</span>
                                <span className="text-sm font-medium text-[#0f1a14] dark:text-white">60-Min Delivery</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-16 rounded-2xl overflow-hidden border-4 border-white dark:border-[#2A3038] shadow-2xl">
                        <div className="w-full aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC8dxSXznn3TveUPUZ_EyPlrkVHZO5YhT7OTPeMIu9US0yxJLjCDkyfhk5A0sjdenFCmxrm-9eGvTx3dF-lAlLG3xM_qvbwXaDKjNHrQl_Cu4j316UT8tdZp2v2Cdyh93WQ3QPELad86-E9ZhIEmmdMbzAwm5CwCPAkv-zcv3jfd0fRbKCb0CTDHSDPgh_49RdsAj8kFm-R7fD4UrBpNhgLq6DjY34BPDc5u6I--DoU2QJwOp0cDD5ZR5csw5n0I8BWbnkdu47aNPI")' }}></div>
                    </div>
                </div>
            </div>

            {/* Right Side: Signup Form Panel */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-20 xl:px-32 bg-[#fafafa] dark:bg-[#1a1d23]">
                <div className="w-full max-w-[480px]">
                    {/* Header Component */}
                    <div className="mb-10">
                        <div className="lg:hidden flex items-center gap-2 mb-8">
                            <div className="size-8 bg-[#26d980] rounded flex items-center justify-center text-white">
                                <span className="material-icons-round text-xl">eco</span>
                            </div>
                            <h2 className="text-xl font-bold text-[#0f1a14] dark:text-white">Daily Fresh</h2>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#0f1a14] dark:text-white">Create Your Account</h1>
                        <p className="text-[#0f1a14]/60 dark:text-white/60">Start your journey to fresher meals today.</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 text-red-500 text-sm p-4 rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleSignup}>
                        {/* Full Name TextField */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#0f1a14] dark:text-white ml-1">Full Name</label>
                            <div className="relative group">
                                <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#26d980] transition-colors text-xl">person</span>
                                <input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 h-14 pl-12 pr-4 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#26d980]/20 focus:border-[#26d980] placeholder:text-slate-400 transition-all"
                                    placeholder="Jane Doe"
                                    type="text"
                                    required
                                />
                            </div>
                        </div>
                        {/* Email Address TextField */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#0f1a14] dark:text-white ml-1">Email Address</label>
                            <div className="relative group">
                                <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#26d980] transition-colors text-xl">email</span>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 h-14 pl-12 pr-4 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#26d980]/20 focus:border-[#26d980] placeholder:text-slate-400 transition-all"
                                    placeholder="jane@example.com"
                                    type="email"
                                    required
                                />
                            </div>
                        </div>
                        {/* Phone Number TextField */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#0f1a14] dark:text-white ml-1">Phone Number</label>
                            <div className="relative group">
                                <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#26d980] transition-colors text-xl">call</span>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 h-14 pl-12 pr-4 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#26d980]/20 focus:border-[#26d980] placeholder:text-slate-400 transition-all"
                                    placeholder="+1 (555) 000-0000"
                                    type="tel"
                                />
                            </div>
                        </div>
                        {/* Password Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#0f1a14] dark:text-white ml-1">Password</label>
                                <div className="relative group">
                                    <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#26d980] transition-colors text-xl">lock</span>
                                    <input
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 h-14 pl-12 pr-4 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#26d980]/20 focus:border-[#26d980] placeholder:text-slate-400 transition-all"
                                        placeholder="••••••••"
                                        type="password"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#0f1a14] dark:text-white ml-1">Confirm</label>
                                <div className="relative group">
                                    <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#26d980] transition-colors text-xl">security</span>
                                    <input
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 h-14 pl-12 pr-4 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#26d980]/20 focus:border-[#26d980] placeholder:text-slate-400 transition-all"
                                        placeholder="••••••••"
                                        type="password"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-3 py-2">
                            <input className="mt-1 size-5 rounded text-[#26d980] focus:ring-[#26d980] border-[#d1e5db] dark:border-white/10 bg-white dark:bg-[#2A3038]" id="terms" type="checkbox" required />
                            <label className="text-sm leading-relaxed text-[#0f1a14]/70 dark:text-white/70" htmlFor="terms">
                                I agree to the <a className="text-[#26d980] font-semibold hover:underline" href="#">Terms and Conditions</a> and <a className="text-[#26d980] font-semibold hover:underline" href="#">Privacy Policy</a>.
                            </label>
                        </div>
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex min-h-[56px] cursor-pointer items-center justify-center rounded-xl bg-[#26d980] hover:bg-[#26d980]/90 text-[#0f1a14] text-base font-bold transition-all shadow-lg shadow-[#26d980]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                        {/* Footer Link */}
                        <div className="pt-6 text-center border-t border-[#d1e5db] dark:border-white/10 mt-8">
                            <p className="text-sm text-[#0f1a14]/60 dark:text-white/60">
                                Already have an account?
                                <Link className="text-[#26d980] font-bold ml-1 hover:underline" href="/login">Login</Link>
                            </p>
                        </div>
                    </form>
                </div>
                {/* Subtle Decorative Elements */}
                <div className="mt-auto pt-10 flex gap-4 opacity-30 grayscale">
                    <div className="size-8 bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBxJnMVVZ2rOxi3H3miWUAhBx1U6s9ESncxujpGBrzaI0T5DI_qlO_YLArdXNzmFuWMRAWmbMFisNQPn8htATx2Yv2jnDrtu2TtNLXTGpOlf2FNM8SVitGn4QYapoE1LHF2EdpwofD3W-M-mArWf2_mKXaC_dfRw-Xv1rsxAJIrqkFf7fXRigo6bg47_dNcpyUATziJb8EKIEW1OAzxpup1EazCTeIZPH5t8A1KOY1zb6BhdSXZYtCMqcvZpl6C3muI-DHGjwvE2XU")' }}></div>
                    <div className="size-8 bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA-povDHqL4acqLkj2BxNbcctbMRtH4jO5wpbwWJ_iG13UZPDnjsg0QTlbj7vX31BlRX0wDfQ0APMB1YocziZS1gRKqIT1A50fwUDYpCebILc55-Nru6Q1ImvdNVWm_BGG0JzGQvnwQ5mfJEQEYBJ5BBoVLU9V3kUf0YNzKr2ZyPg78cvdgFeo-47LQNnlDkyAa7AZdjV42wWty9q6fnauKxoltlOQp9_0iKPqoc9ZDpC-igP_Z-xsdCV_vgAmvI58Wi2V3iXSPZF0")' }}></div>
                    <div className="size-8 bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDBVRElJPejFX42mxjf53qn3CXAk-GqYGsj4BFPA7HbD6RDjNwFhMBdoIZ-2Gb2ylLRi0I_r-QiEJ0Tgsxhg8Y5Az-u-RXbEliKOIueY62LrZw58GC-o5tYEQ2mSyCx3tHwkT3YjsoYcfWK2DAN1dUWvkWCRYU265VhOLgrA3oKrt_0jss6o5A-34isKq1PkqDLPwFqrDgMiHztGRqnoSAlPvIWg_xM1NGcr-2O92PAbpeU4Bfyi7A1mtWYcOBF_9bMTkHzByvCjrk")' }}></div>
                </div>
            </div>
        </div>
    );
}
