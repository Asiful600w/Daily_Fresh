'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
    const [isSigningOut, setIsSigningOut] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                setSession(session);
                // Extend user object with data from public.User if needed, 
                // or just use the session user which is now the source of truth for auth.
                // For now, we just set the Supabase Auth User.
                // In a real app we might fetch public.User here to get the role.
                const { data: profile } = await supabase
                    .from('User')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    // Merge profile data securely
                    setUser({
                        ...session.user,
                        role: profile.role,
                        user_metadata: {
                            ...session.user.user_metadata,
                            full_name: profile.name,
                            phone: profile.phone
                        }
                    } as any);
                } else {
                    setUser(session.user);
                }
            } else {
                setSession(null);
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        setIsSigningOut(true);
        try {
            await supabase.auth.signOut();
            // Use window.location for hard redirect to clear all state
            window.location.href = '/';
        } catch (error) {
            console.error('Error signing out:', error);
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
