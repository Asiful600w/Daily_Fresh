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
    refreshSession: () => Promise<Session | null>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
    refreshSession: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children, initialUser = null }: { children: React.ReactNode; initialUser?: User | null }) {
    const [user, setUser] = useState<User | null>(initialUser);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(!initialUser);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        let mounted = true;

        // Safety timeout to prevent infinite loading
        const safetyTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Auth check timed out, forcing app to load');
                setLoading(false);
            }
        }, 5000);

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event: any, session: Session | null) => {
            if (!mounted) return;

            if (session) {
                setSession(session);

                // If we already have an initialUser (hydrated from server), matches session, and loading is false,
                // we might want to skip refetching to prevent flash, OR verify data.
                // For now, let's allow it to re-verify/refetch to be safe, but UI shows initialUser in meantime.

                try {
                    const { data: profile } = await supabase
                        .from('User')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (mounted) {
                        if (profile) {
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
                    }
                } catch (e) {
                    console.error('Profile fetch error', e);
                    if (mounted) setUser(session.user);
                }
            } else {
                setSession(null);
                setUser(null);
            }

            if (mounted) setLoading(false);
        });

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
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

    const refreshSession = async (): Promise<Session | null> => {
        try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) {
                console.error("Error refreshing session:", error);
                return null;
            }
            if (data.session) {
                setSession(data.session);
            }
            return data.session;
        } catch (error) {
            console.error("Exception refreshing session:", error);
            return null;
        }
    };

    const value = {
        session,
        user,
        loading,
        signOut,
        refreshSession,
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
