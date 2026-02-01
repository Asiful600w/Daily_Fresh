'use client';
import { useState, useEffect } from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminLogin() {
    const router = useRouter();
    const { adminUser, adminLoading } = useAdminAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If already logged in, redirect
    // If already logged in, redirect
    useEffect(() => {
        // Only redirect if we're not currently in the middle of a manual login attempt (loading)
        if (!adminLoading && adminUser && !loading) {
            router.push('/admin');
        }
    }, [adminUser, adminLoading, router, loading]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user }, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            if (user) {
                // Check public.admins table for status via Server-Side API (Bypasses RLS issues)
                // Use a timeout to prevent infinite loading
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                try {
                    const verifyRes = await fetch('/api/admin/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id, email: user.email }),
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    if (!verifyRes.ok) {
                        const errorText = await verifyRes.text(); // Read as text first to avoid JSON parse errors
                        let errorData;
                        try {
                            errorData = JSON.parse(errorText);
                        } catch (e) {
                            errorData = { error: errorText || verifyRes.statusText };
                        }

                        await supabaseAdmin.auth.signOut();
                        throw new Error(errorData.error || 'Access Denied: You do not have permission to access the admin area.');
                    }

                    const adminData = await verifyRes.json();

                    if (adminData.status === 'pending') {
                        await supabaseAdmin.auth.signOut();
                        throw new Error('Account Pending: Your account is awaiting approval from an administrator.');
                    }

                    if (adminData.status === 'rejected' || adminData.status === 'suspended') {
                        await supabaseAdmin.auth.signOut();
                        throw new Error('Access Denied: Your account has been suspended or rejected.');
                    }

                    // Success
                    router.push('/admin');
                    router.refresh();
                } catch (fetchErr: any) {
                    clearTimeout(timeoutId);
                    if (fetchErr.name === 'AbortError') {
                        throw new Error('Verification timed out. Please try again.');
                    }
                    throw fetchErr;
                }
            }
        } catch (err: any) {
            // Generic error message for security and user requirement
            setError('You are not registered as admin');
            console.error("Login attempt failed:", err.message); // Log actual error for debugging

            // Ensure we are signed out if we failed checks
            const currentSession = await supabaseAdmin.auth.getSession();
            if (currentSession.data.session) {
                await supabaseAdmin.auth.signOut();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                        <span className="material-icons-round text-white text-2xl">admin_panel_settings</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Login</h1>
                    <p className="text-slate-500 text-sm mt-2">Secure access for staff only</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            placeholder="admin@dailyfresh.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        {loading ? 'Authenticating...' : 'Access Dashboard'}
                    </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-4 text-center">
                    <Link href="/admin/register" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                        Register as Merchant
                    </Link>
                    <Link href="/" className="text-sm text-slate-400 hover:text-primary transition-colors">
                        ← Back to Store
                    </Link>
                </div>
            </div>
        </div>
    );
}
