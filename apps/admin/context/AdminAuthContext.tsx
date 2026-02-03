'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';

export interface AdminUser {
    id: string;
    email?: string | null;
    role: 'ADMIN' | 'MERCHANT' | 'CUSTOMER'; // Updated to match schema
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

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [adminLoading, setAdminLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        const syncUser = async () => {
            if (session?.user) {
                try {
                    // Start with session data
                    const baseUser: AdminUser = {
                        id: session.user.id,
                        email: session.user.email,
                        role: (session.user as any).role || 'MERCHANT',
                        image: session.user.image,
                        full_name: session.user.name || undefined
                    };

                    // Fetch extended profile if needed
                    // (e.g. for shop_name which might not be in session)
                    try {
                        const res = await fetch('/api/admin/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: baseUser.id, email: baseUser.email })
                        });

                        if (res.ok) {
                            const profile = await res.json();
                            setAdminUser({
                                ...baseUser,
                                ...profile
                            });
                        } else {
                            // If verify fails, still log them in but maybe with limited data?
                            // Or relies on session data only.
                            console.warn("Verify API failed, using base session data");
                            setAdminUser(baseUser);
                        }
                    } catch (e) {
                        console.warn("Verify API fetch error, using base session data", e);
                        setAdminUser(baseUser);
                    }

                } catch (error) {
                    console.error("Admin Auth sync error:", error);
                    setAdminUser(null);
                }
            } else {
                setAdminUser(null);
            }
            setAdminLoading(false);
        };

        syncUser();

    }, [session, status]);

    const signOutAdmin = async () => {
        await signOut({ redirect: false });
        router.push('/admin/login');
        router.refresh();
    };

    const value = {
        adminUser,
        adminLoading,
        signOutAdmin,
        setAdminUser,
    };

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
