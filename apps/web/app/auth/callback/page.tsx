'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        // The supabase client is configured with detectSessionInUrl: true
        // so it should automatically handle the hash/fragment and set the session.
        // We just need to wait a moment or check session state, then redirect.

        const handleAuth = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Auth error:', error);
                // Optionally show error
            }
            // Whether session exists or not (maybe just verified email), redirect to login
            // Using window.location to properly clear url params
            window.location.href = '/login';
        };

        handleAuth();
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#111827]">
            <div className="text-center space-y-4">
                <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verifying...</h2>
                <p className="text-slate-500 text-sm">Please wait while we verify your request.</p>
            </div>
        </div>
    );
}
