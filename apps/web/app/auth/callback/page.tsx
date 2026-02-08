'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
    const [supabase] = useState(() => createClient());

    useEffect(() => {
        // The supabase client is configured with detectSessionInUrl: true
        // so it should automatically handle the hash/fragment and set the session.
        // We just need to wait a moment or check session state, then redirect.

        const handleAuth = async () => {
            // Extract the 'code' parameter from the URL
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');

            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    console.error('Auth error:', error);
                    // Optionally show error
                }
            } else {
                // If no code, perhaps it's a different auth flow or an error
                console.warn('No code found in URL for exchangeCodeForSession.');
                // Optionally handle this case, e.g., redirect to an error page or login
            }

            // Whether session exists or not (maybe just verified email), redirect to login
            // Using window.location to properly clear url params
            window.location.href = '/login';
        };

        handleAuth();
    }, [supabase]);

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
