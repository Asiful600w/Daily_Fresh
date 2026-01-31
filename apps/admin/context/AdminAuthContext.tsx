'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { useRouter } from 'next/navigation';

type AdminAuthContextType = {
    adminUser: User | null;
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
    const [adminUser, setAdminUser] = useState<User | null>(null);
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
                setAdminUser(session?.user ?? null);
            } catch (error) {
                console.error("Admin Auth initialization error:", error);
                setAdminSession(null);
                setAdminUser(null);
            } finally {
                setAdminLoading(false);
            }
        };

        const { data: listener } = supabaseAdmin.auth.onAuthStateChange((_event, session) => {
            setAdminSession(session);
            setAdminUser(session?.user ?? null);
            setAdminLoading(false);
        });

        setData();

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const signOutAdmin = async () => {
        await supabaseAdmin.auth.signOut();
        // No need to clear 'cart' here as this is admin side
        router.push('/admin/login');
        router.refresh();
    };

    const value = {
        adminSession,
        adminUser,
        adminLoading,
        signOutAdmin,
    };

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
