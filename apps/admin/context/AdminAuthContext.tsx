'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { useRouter } from 'next/navigation';

export interface AdminUser extends User {
    id: string; // Explicitly ensure id is string (User has it)
    email?: string; // User has email optionally
    role: 'super_admin' | 'admin' | 'merchant';
    full_name?: string;
    shop_name?: string;
}

type AdminAuthContextType = {
    adminUser: AdminUser | null;
    adminSession: Session | null;
    adminLoading: boolean;
    signOutAdmin: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextType>({
    adminUser: null,
    adminSession: null,
    adminLoading: true,
    signOutAdmin: async () => { },
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null); // Use custom AdminUser type
    const [adminSession, setAdminSession] = useState<Session | null>(null);
    const [adminLoading, setAdminLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const setData = async () => {
            try {
                // Use supabaseAdmin client
                const { data: { session }, error } = await supabaseAdmin.auth.getSession();
                if (error) throw error;
                setAdminSession(session);

                if (session?.user) {
                    // Fetch extended profile via API to bypass RLS
                    try {
                        const res = await fetch('/api/admin/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: session.user.id, email: session.user.email })
                        });

                        if (res.ok) {
                            const profile = await res.json();
                            setAdminUser({
                                ...session.user,
                                ...profile
                            } as AdminUser);
                        } else {
                            console.error("User in session but verification failed:", res.statusText);
                            // Do not sign out immediately here to avoid loop if transient error,
                            // but maybe we should if 404/403.
                            if (res.status === 404 || res.status === 403) {
                                console.error("Profile not found or denied. Signing out.");
                                await supabaseAdmin.auth.signOut();
                                setAdminUser(null);
                                setAdminSession(null);
                            }
                        }
                    } catch (apiError) {
                        console.error("Failed to fetch admin profile:", apiError);
                    }
                } else {
                    setAdminUser(null);
                }
            } catch (error) {
                console.error("Admin Auth initialization error:", error);
                setAdminSession(null);
                setAdminUser(null);
            } finally {
                setAdminLoading(false);
            }
        };

        const { data: listener } = supabaseAdmin.auth.onAuthStateChange(async (_event, session) => {
            setAdminSession(session);
            if (session?.user) {
                try {
                    const res = await fetch('/api/admin/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: session.user.id, email: session.user.email })
                    });

                    if (res.ok) {
                        const profile = await res.json();
                        setAdminUser({ ...session.user, ...profile } as AdminUser);
                    } else {
                        setAdminUser(null);
                    }
                } catch {
                    setAdminUser(null);
                }
            } else {
                setAdminUser(null);
            }
            setAdminLoading(false);
        });

        setData();

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const signOutAdmin = async () => {
        await supabaseAdmin.auth.signOut();
        router.push('/admin/login');
        router.refresh();
    };

    const value = {
        adminSession,
        adminUser, // Now strictly typed as AdminUser (extended)
        adminLoading,
        signOutAdmin,
    };

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
