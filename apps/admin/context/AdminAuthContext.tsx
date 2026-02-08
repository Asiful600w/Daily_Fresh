'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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


export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [adminLoading, setAdminLoading] = useState(true);
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
        }, 5000);

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log("AdminAuth event:", event, "User:", session?.user?.email);

            if (session?.user) {
                try {
                    // Fetch role from public.User
                    const { data: profile, error } = await supabase
                        .from('User')
                        .select('role, name, shopName, id, email')
                        .eq('id', session.user.id)
                        .single();

                    if (error) {
                        console.error("Error fetching admin profile:", error);
                        // Don't set adminUser if profile fetch fails
                        setAdminUser(null);
                    } else if (profile) {
                        const role = profile.role as 'SUPERADMIN' | 'MERCHANT' | 'CUSTOMER';
                        // Check permissions
                        if (role !== 'SUPERADMIN' && role !== 'MERCHANT') {
                            console.warn("User logged in but not admin/merchant:", role);
                            setAdminUser(null);
                        } else {
                            setAdminUser({
                                id: session.user.id,
                                email: session.user.email,
                                role: role,
                                full_name: profile.name,
                                shop_name: profile.shopName,
                                image: session.user.user_metadata?.avatar_url
                            });
                        }
                    } else {
                        console.warn("No profile found for user:", session.user.id);
                        setAdminUser(null);
                    }
                } catch (e) {
                    console.error("Exception fetching admin profile:", e);
                    setAdminUser(null);
                }
            } else {
                setAdminUser(null);
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
    }, []);

    const signOutAdmin = useCallback(async () => {
        await supabase.auth.signOut();
        // Use window.location for hard redirect to clear all state
        window.location.href = '/admin/login';
    }, [supabase]);

    const value = {
        adminUser,
        adminLoading,
        signOutAdmin,
        setAdminUser,
    };

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
