'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useSession, signOut as nextAuthSignOut } from "next-auth/react"

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

    // Use NextAuth session instead of Supabase client
    const { data: nextAuthSession, status } = useSession();

    useEffect(() => {
        if (status === 'loading') {
            setLoading(true);
        } else {
            setSession(nextAuthSession as unknown as Session);
            // Map NextAuth user to similar structure if needed, or just use it
            // Adjusting type to match what app expects (Supabase User vs NextAuth User)
            // For now casting, but ideally we unify types.
            setUser(nextAuthSession?.user as unknown as User | null);
            setLoading(false);
        }
    }, [nextAuthSession, status]);

    const [isSigningOut, setIsSigningOut] = useState(false);

    const signOut = async () => {
        setIsSigningOut(true);
        try {
            await nextAuthSignOut({ callbackUrl: '/' });
            // State clear handled by page reload/redirect
        } catch (err) {
            console.error('Logout error:', err);
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
