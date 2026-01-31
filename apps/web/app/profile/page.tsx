'use client';


import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { supabase } from '@/lib/supabase';
import { getUserOrders } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { RecentOrders } from '@/components/profile/RecentOrders';
import { QuickActions } from '@/components/profile/QuickActions';
import { AddressCard } from '@/components/profile/AddressCard';
import { MembershipCard } from '@/components/profile/MembershipCard';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const { wishlistIds } = useWishlist();
    // const user = { id: 'test-user-id', user_metadata: { full_name: "John Doe", avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD65BJL0r1X8Npp05j0dH01w9PaEy72vCm25F5Z2k81SlsKaQVDxR8ABDXhMG5tP7Sm97zkv_vrjAesoljrTKYml1nXRoYwUhalbeSfNM_jqtkRaM3eVgco6gfUHXzySrs_PNb7razmQFqVIeZterdllROAFGSMNiKmMfAPtICJ4t8C_T8jD4TZAjuplMArHQ86DMi6CPHndHuC0FLC6f_Fxlex_EyV14aUlbash-rxbZc0GCGcs7y_R-gGSX7lBiPHSEwzARMRUTo" }, email: 'john@example.com' }; const authLoading = false;
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [stats, setStats] = useState({
        pendingOrders: 0,
        savedItems: 0,
        completedOrders: 0,
        totalSpent: 0
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchDashboardData();
        }
    }, [user, authLoading]);

    // Update stats when wishlistIds changes
    useEffect(() => {
        setStats(prev => ({
            ...prev,
            savedItems: wishlistIds.length
        }));
    }, [wishlistIds]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch Orders
            const allOrders = await getUserOrders(user!.id);
            const recentOrders = allOrders.slice(0, 5);

            setStats(prev => ({
                ...prev,
                // savedItems is handled by effect above
                activeOrders: allOrders ? allOrders.filter((o: any) => o.status !== 'delivered').length : 0,
                pendingOrders: allOrders
                    ? allOrders.filter((o: any) => o.status === 'pending').length
                    : 0,
                completedOrders: allOrders ? allOrders.filter((o: any) => o.status === 'delivered').length : 0, // Replaces Total Saved count context
                totalSpent: allOrders
                    ? allOrders
                        .filter((o: any) => o.status === 'delivered')
                        .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)
                    : 0
            }));

            setOrders(recentOrders);

        } catch (error) {
            console.error('Error loading dashboard data!', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex justify-center bg-background-light dark:bg-background-dark min-h-screen">
            <div className="flex w-full max-w-[1280px]">
                <ProfileSidebar activeTab="overview" />

                <main className="flex flex-col flex-1 p-4 md:p-8">
                    {/* PageHeading */}
                    <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                        <div className="flex flex-col gap-2">

                            <p className="text-[#0d1b17] dark:text-white text-4xl font-black tracking-tight">Profile Overview</p>
                            <p className="text-[#4c9a80] text-base font-normal">
                                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}! Here's what's happening with your groceries today.
                            </p>
                        </div>
                        <div className="text-[#4c9a80] text-sm font-medium bg-white dark:bg-[#10221c] px-4 py-2 rounded-lg border border-[#cfe7df] dark:border-[#1e3a31]">
                            Today is {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>

                    <ProfileStats stats={stats} />

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="xl:col-span-2">
                            <RecentOrders orders={orders} />
                            <QuickActions />
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-6">
                            <AddressCard />
                            <MembershipCard />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
