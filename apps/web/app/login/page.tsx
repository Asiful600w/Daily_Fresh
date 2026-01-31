'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
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
            router.push('/'); // Redirect to home on success
            router.refresh(); // Refresh to update auth state in UI
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        // Placeholder for social login logic
        console.log(`Login with ${provider}`);
        alert(`${provider} login is not yet configured.`);
    }

    return (
        <div className="split-screen overflow-hidden min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left Panel: Hero Visuals */}
            <div className="hero-panel relative flex flex-col justify-end p-16 text-white overflow-hidden hidden lg:flex">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAXh5dFBHFjkE9K8rO_LVdeBxfMpWFtv0jbLgrhxPVmJ_VAEL1fztm8wX2HJ4bC6lMEm5ijEPMwuseWYHkZlCrxSIgEszEe0LY4uCDlJv6SLhd1r15c0FtV7ob-j6tyBkGWgtla3p63caEItmGF8bmAb9uVVMRIPPFFkkNjnlKLalzbQtMPCoDOvgPF4GzdzcL540C6dk2vXf3B0OG4D7yFZtVHMeCSDNf1KEKYnxQ6va3WgkHuExAiHS8sZq_jMDmfJh1FvZNXgW4')" }}
                >
                </div>
                {/* Gradient Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="relative z-10 max-w-lg">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="size-10 bg-[#26d980] rounded-xl flex items-center justify-center text-[#1f2e24]">
                            <svg className="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Daily Fresh</span>
                    </div>
                    <h1 className="text-5xl font-extrabold leading-[1.1] mb-6 tracking-tight">
                        Freshness delivered to your doorstep.
                    </h1>
                    <p className="text-xl font-medium text-white/90">
                        Join our community of 50,000+ healthy eaters and transform your kitchen today.
                    </p>
                </div>
                {/* Floating badge */}
                <div className="absolute top-10 right-10 z-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-3">
                    <div className="flex -space-x-2">
                        <img className="size-8 rounded-full border-2 border-white" alt="User avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGWkt1hHuvx9HLISxNiGIqRqA_DwHee1q-h0E5twAyFoEV7Y5aGv0MHQiyj7yBGJhSQge74RrR4Go0bd2Pcc_fA7sYiaEzxBE8EPVNlzoGRN8ZXIyXQz7dJtixQlHTPI3yajx4J67jKnTGxPuFcFQ6q7aa3_Z9yZqlk93uaqKuKA66VbvzxC2fGdOpK11nSWd1sKAH0SYJLWNQqofloAGUQG9dh5O0TcrgXSsguiP5-E_RIia6I0ejGUDPCvf0dddBEBRDH58CkGM" />
                        <img className="size-8 rounded-full border-2 border-white" alt="User avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3-O_o2RRQXuIUuZvlnmhibyo4krkYcJJOeiGgBcVKCi68TptH3KVZ1lteCLTitDIsBHXQARiiH3wdqVkzKUcOOyHfFLttfJ4igu3WUk7msY2KHfVjBR8syVIr62czUC-fk5orc9MA3SFPgdfGZwavp6boLXrVv3nZYudHsIUVcJirgiIlAYNK7bxItOD-VVWbNeLWaTIrbuU_z_IWtq2Hv5Esmj5XaoltePbYww2vRgyrH2EFLwI1Und7i3BNV0bJkYkGMXw6nVo" />
                        <img className="size-8 rounded-full border-2 border-white" alt="User avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbImqKj-8RE8k2l9OdeV-dc1OYFCdSPdt7KCqbbvd0YcgVa4F722m5tFx-g07y7rktVTEJL2CbeGn9KrRMOMg3EkOiREj95Kc0BgYCcw4dsnfP-ZJ08825d4yquTZDn2QPl5T7jouDLdjyTJ2LhwPqpR65uX1RklsVdzsYTHsjhdcsKzdC7_h5cF3u3vRGRyBsTwca6Y9LuGR5T3ZH95pA3yLZZnfpqXJkOeu6fPQ7Qo6G_7cIZBYJlRz3OxJiCqQ3C2ylz345TT0" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider">Trusted by 50k+ daily</p>
                </div>
            </div>

            {/* Right Panel: Login Form */}
            <div className="flex flex-col justify-center items-center px-6 py-12 lg:px-24 bg-white dark:bg-[#1f2e24]">
                <div className="w-full max-w-[440px] space-y-8">
                    {/* Header */}
                    <div className="text-left">
                        <h2 className="text-3xl font-bold text-[#0f1a14] dark:text-white mb-2">Welcome Back</h2>
                        <p className="text-[#539373] dark:text-gray-400 font-medium">Log in to your account to start shopping.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm p-4 rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Social Login Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-2 h-14 border border-[#d1e5db] dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <img className="size-5" alt="Google logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtCTxdFkhvTSu1BeADho-cnOKPsJ2oeoM2nOFxl5TMc8V3F1dSCDePHxfz2_rhalZSea33u5EU0rmR8_nXKvOFgOgS5UuMojOuuOpSLpKxajfmL13pUVMBCEI4-hMK83C5o5Dm4LIxxxlFhN3G0t6-JKeegK1-kdFfitd2gJNpUYbn1JbEEM8Y5XlzH7h9h5m5aGMR1Q6ZQSiFIXUek8KvBlN6JeAH1eiCDrxwsQUy0jccsc3fcqkSkJyOy7XpuqttOiHrCSCLYdg" />
                            <span className="text-sm font-bold text-[#0f1a14] dark:text-white">Google</span>
                        </button>
                        <button onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center gap-2 h-14 border border-[#d1e5db] dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <img className="size-5" alt="Facebook logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMlbbYWAvn7JkM___wllDcnqRsVnwVfdtURAnSJo5c3Ws4uSXbEsBwvGkYoTqdAwh6z-fuKYSsWdfNuzm6cWlXJkwnYn4svvMJRg7SsBcxqZ_te4bsiMWwXeMZPZsNHAINiLtAMfOwgqYDhoXlNwReVVEySbf8eEXj1FLFAmTPcetnTHguQB355Ap4lcAqmHeyOsHfRC1BZXEcK0IoZm57Jjj1TulJvc7w3FlcNi4kJ-hFmdK9ggFY5985PC_Sm7tqnPQAKaKe294" />
                            <span className="text-sm font-bold text-[#0f1a14] dark:text-white">Facebook</span>
                        </button>
                    </div>

                    <div className="relative flex items-center py-4">
                        <div className="flex-grow border-t border-[#e8f2ed] dark:border-gray-800"></div>
                        <span className="flex-shrink mx-4 text-xs font-bold text-[#539373] uppercase tracking-widest">Or login with email</span>
                        <div className="flex-grow border-t border-[#e8f2ed] dark:border-gray-800"></div>
                    </div>

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleLogin}>
                        {/* Email Field */}
                        <div className="flex flex-col w-full">
                            <label className="text-[#0f1a14] dark:text-white text-sm font-bold mb-2 ml-1">Email Address</label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input w-full rounded-xl text-[#0f1a14] dark:text-white focus:ring-[#26d980] focus:border-[#26d980] border border-[#d1e5db] dark:border-gray-700 bg-white dark:bg-gray-800/50 h-14 placeholder:text-[#539373]/50 px-5 transition-all"
                                placeholder="e.g., alex@email.com"
                                type="email"
                                required
                            />
                        </div>
                        {/* Password Field */}
                        <div className="flex flex-col w-full">
                            <div className="flex justify-between items-center mb-2 ml-1">
                                <label className="text-[#0f1a14] dark:text-white text-sm font-bold">Password</label>
                                <a className="text-[#26A7D9] hover:underline text-sm font-bold" href="#">Forgot Password?</a>
                            </div>
                            <div className="relative">
                                <input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-input w-full rounded-xl text-[#0f1a14] dark:text-white focus:ring-[#26d980] focus:border-[#26d980] border border-[#d1e5db] dark:border-gray-700 bg-white dark:bg-gray-800/50 h-14 placeholder:text-[#539373]/50 px-5 pr-12 transition-all"
                                    placeholder="••••••••"
                                    type="password"
                                    required
                                />
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#539373] hover:text-[#26d980] transition-colors" type="button">
                                    <span className="material-symbols-outlined">visibility</span>
                                </button>
                            </div>
                        </div>
                        {/* Remember Me */}
                        <div className="flex items-center gap-2 px-1">
                            <input className="size-5 rounded border-[#d1e5db] text-[#26d980] focus:ring-[#26d980]" id="remember" type="checkbox" />
                            <label className="text-sm font-medium text-[#539373] cursor-pointer" htmlFor="remember">Keep me signed in</label>
                        </div>
                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-[#26d980] hover:bg-[#26d980]/90 text-[#0f1a14] font-bold text-lg rounded-xl shadow-lg shadow-[#26d980]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span>Signing In...</span>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="pt-6 text-center">
                        <p className="text-[#539373] dark:text-gray-400 font-medium">
                            Don&apos;t have an account?
                            <Link className="text-[#26d980] font-bold hover:underline ml-1" href="/signup">Sign Up for free</Link>
                        </p>
                    </div>
                </div>
                {/* Footer Small Print */}
                <div className="mt-auto pt-10 text-xs text-[#539373]/60 dark:text-gray-500 flex gap-4">
                    <a className="hover:text-[#26d980] transition-colors" href="#">Terms of Service</a>
                    <a className="hover:text-[#26d980] transition-colors" href="#">Privacy Policy</a>
                    <span>© 2024 Daily Fresh Inc.</span>
                </div>
            </div>
        </div>
    );
}
