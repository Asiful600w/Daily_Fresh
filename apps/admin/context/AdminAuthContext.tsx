'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { signOutAdmin as signOutAdminAction } from '@/actions/auth';

export interface AdminUser {
    id: string;
    email?: string | null;
    role: 'SUPERADMIN' | 'MERCHANT' | 'CUSTOMER'; // Updated to match schema
    full_name?: string;
    shop_name?: string;
    phone?: string;
    image?: string | null;
}

type AdminAuthContextType = {
    adminUser: AdminUser | null;
    adminLoading: boolean;
    signOutAdmin: () => Promise<void>;
    setAdminUser: React.Dispatch<React.SetStateAction<AdminUser | null>>;
};

const AdminAuthContext = createContext<AdminAuthContextType>({
    adminUser: null,
    adminLoading: true,
    signOutAdmin: async () => { },
    setAdminUser: () => { },
});

export const useAdminAuth = () => useContext(AdminAuthContext);


export function AdminAuthProvider({ children, initialUser = null }: { children: React.ReactNode; initialUser?: AdminUser | null }) {
    const [adminUser, setAdminUser] = useState<AdminUser | null>(initialUser);
    const [adminLoading, setAdminLoading] = useState(!initialUser);
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);


    useEffect(() => {
        let mounted = true;

        // Safety timeout to prevent infinite loading if Supabase hangs
        const loadingTimer = setTimeout(() => {
            if (mounted && adminLoading) {
                console.warn("Admin Auth check timed out, forcing loading false");
                setAdminLoading(false);
            }
        }, 15000); // Increased to 15s for slower connections

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log("[AdminAuth] Event:", event, "User:", session?.user?.email);

            // Handle potential flicker by checking local session if event is null/INITIAL_SESSION
            let currentSession = session;
            if (!currentSession && (event === 'INITIAL_SESSION')) {
                // If we have initialUser, likely the session is valid in cookie but not yet in client 'session' object
                // But createClient() browser might pick it up automatically?
                const { data } = await supabase.auth.getSession();
                currentSession = data.session;

                if (currentSession) console.log("[AdminAuth] Recovered session from getSession()");
                // If still no session but we have initialUser, it might be that cookie is there but not loaded?
                // Actually, if we pass initialUser, we are confident. 
                // But we should verify. 
                // However, let's stick to the flow. if initialUser is set, adminLoading is false. UI is visible.
            }

            // ... rest of logic


            if (currentSession?.user) {
                // OPTIMIZATION: If we already have a user and ID matches, skip fetch to prevent flicker/errors
                // We use a functional state update or ref to check current value without dependency cycle? 
                // Actually, we can use the 'adminUser' from closure if we add it to deps, but that causes re-subscription.
                // Better: Check local storage? Or just rely on the fact that if we have a session, we verify fetching.

                // Let's implement a "stale-while-revalidate" approach manually or just simple cache id check.
                // Since we can't easily access current 'adminUser' state inside this closure without re-running effect,
                // we will fetch profile but handle errors GRACEFULLY.

                try {
                    // Fetch role from public.User
                    const { data: profile, error } = await supabase
                        .from('User')
                        .select('role, name, shopName, id, email')
                        .eq('id', currentSession.user.id)
                        .single();

                    if (error) {
                        console.error("[AdminAuth] Error fetching profile:", error);
                        // CRITICAL FIX: Do NOT log out on temporary fetch errors if we have a session.
                        // Only log out if we don't have a previous user? 
                        // Since we can't see previous 'adminUser', we will assume valid if we are refreshing.
                        // But if it's INITIAL load and this fails, we might be stuck?
                        // If it fails, we keep `adminUser` as null (if it was null) which triggers loading->false but no user->redirect.
                        // That is correct for initial load failure.
                        // But for REFRESH (event == TOKEN_REFRESHED), we want to KEEP the user.

                        if (event === 'TOKEN_REFRESHED') {
                            console.warn("[AdminAuth] Profile fetch failed during refresh, ignoring to preserve session.");
                            // Do nothing, keep existing state.
                        } else {
                            setAdminUser(null);
                        }

                    } else if (profile) {
                        const role = profile.role as 'SUPERADMIN' | 'MERCHANT' | 'CUSTOMER';
                        if (role !== 'SUPERADMIN' && role !== 'MERCHANT') {
                            console.warn("[AdminAuth] Unauthorized role:", role);
                            // Force signout?
                            await supabase.auth.signOut();
                            setAdminUser(null);
                        } else {
                            if (mounted) {
                                setAdminUser({
                                    id: currentSession.user.id,
                                    email: currentSession.user.email,
                                    role: role,
                                    full_name: profile.name,
                                    shop_name: profile.shopName,
                                    image: currentSession.user.user_metadata?.avatar_url
                                });
                            }
                        }
                    } else {
                        // Profile not found
                        setAdminUser(null);
                    }
                } catch (e) {
                    console.error("[AdminAuth] Profile fetch exception:", e);
                    if (event !== 'TOKEN_REFRESHED') {
                        setAdminUser(null);
                    }
                }
            } else {
                // Only clear if we are sure there's no session
                // SIGNED_OUT event is definitive
                if (event === 'SIGNED_OUT') {
                    setAdminUser(null);
                } else if (!currentSession) {
                    setAdminUser(null);
                }
            }

            if (mounted) {
                setAdminLoading(false);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(loadingTimer);
            subscription.unsubscribe();
        };
    }, [supabase]);

    const signOutAdmin = useCallback(async () => {
        try {
            // 1. Optimistically clear local state
            setAdminUser(null);

            // 2. Clear client-side session flow WITHOUT waiting
            supabase.auth.signOut();
            try {
                localStorage.clear();
                sessionStorage.clear();
            } catch (e) {
                // ignore
            }

            // 3. Navigate to Server-side Logout Route
            window.location.href = '/api/auth/signout';
        } catch (error) {
            console.error("Sign out error", error);
            window.location.href = '/api/auth/signout';
        }
    }, [supabase]);

    const value = {
        adminUser,
        adminLoading,
        signOutAdmin,
        setAdminUser,
    };

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
