'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const setData = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                setSession(session);
                setUser(session?.user ?? null);
            } catch (error) {
                console.error("Auth initialization error:", error);
                // Ensure we don't block the app even on error
                setSession(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        setData();

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const [isSigningOut, setIsSigningOut] = useState(false);

    const signOut = async () => {
        setIsSigningOut(true);
        try {
            // Artificial delay for smooth UX
            await new Promise(resolve => setTimeout(resolve, 800));

            const { error } = await supabase.auth.signOut();
            if (error) {
                const msg = error.message || '';
                // Ignore session missing error
                if (!msg.includes('Auth session missing') && !msg.includes('AuthSessionMissingError')) {
                    console.error('SignOut error:', error);
                }
            }

            // CRITICAL: Force clear local state immediately to ensure UI updates
            setSession(null);
            setUser(null);
            localStorage.removeItem('cart');

            router.push('/');
            router.refresh();
        } catch (err: any) {
            const msg = err?.message || '';
            if (!msg.includes('Auth session missing') && !msg.includes('AuthSessionMissingError')) {
                console.error('Logout Exception:', err);
            }
            // Ensure state is cleared on error
            setSession(null);
            setUser(null);
            localStorage.removeItem('cart');

            router.push('/');
        } finally {
            setIsSigningOut(false);
        }
    };

    const value = {
        session,
        user,
        loading,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            {isSigningOut && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-lg font-medium text-slate-700 animate-pulse">Signing out...</p>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}
