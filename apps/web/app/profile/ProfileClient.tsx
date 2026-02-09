'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { RecentOrders } from '@/components/profile/RecentOrders';
import { QuickActions } from '@/components/profile/QuickActions';
import { AddressCard } from '@/components/profile/AddressCard';
import { MembershipCard } from '@/components/profile/MembershipCard';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';

interface ProfileClientProps {
    initialStats: any;
    initialOrders: any[];
    error?: string;
}

export default function ProfileClient({ initialStats, initialOrders, error: serverError }: ProfileClientProps) {
    const { user, loading: authLoading } = useAuth();
    const { wishlistIds } = useWishlist();
    const [orders, setOrders] = useState<any[]>(initialOrders);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Stats State - sync with initial props
    const [stats, setStats] = useState({
        pendingOrders: initialStats?.pendingOrders || 0,
        activeOrders: initialStats?.activeOrders || 0,
        completedOrders: initialStats?.completedOrders || 0,
        totalSpent: initialStats?.totalSpent || 0,
        savedItems: initialStats?.savedItems || 0
    });

    // Update stats when wishlistIds changes
    useEffect(() => {
        setStats(prev => ({
            ...prev,
            savedItems: wishlistIds.length
        }));
    }, [wishlistIds]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0d1b17] p-4 text-center">
                <div className="bg-white dark:bg-[#10221c] p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 dark:border-[#1e3a31]">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-icons-round text-4xl text-primary">person</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Login Required</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        Please login to view your profile and manage your orders.
                    </p>
                    <Link href="/login" replace className="block w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        Login / Signup
                    </Link>
                    <div className="mt-4">
                        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                            Back to Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (serverError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4">
                <div className="text-center">
                    <span className="material-icons-round text-5xl text-red-500 mb-4">error_outline</span>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Something went wrong</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">{serverError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center bg-background-light dark:bg-background-dark min-h-screen">
            <div className="flex w-full max-w-7xl">
                <ProfileSidebar activeTab="overview" onEditProfile={() => setIsEditModalOpen(true)} />

                <main className="flex flex-col flex-1 p-4 md:p-8 w-full">
                    {/* Mobile Header (Hidden on Desktop) */}
                    <div className="lg:hidden flex items-center gap-4 mb-8 bg-white dark:bg-[#10221c] p-4 rounded-2xl border border-slate-100 dark:border-[#1e3a31] shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border-2 border-primary">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-icons-round text-slate-400 text-2xl">person</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                {user?.user_metadata?.full_name || 'User'}
                            </h2>
                            <p className="text-primary text-xs font-semibold uppercase tracking-wider">Prime Member</p>
                        </div>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition-colors"
                        >
                            <span className="material-icons-round">edit</span>
                        </button>
                    </div>

                    {/* PageHeading */}
                    <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                        <div className="flex flex-col gap-2">

                            <p className="text-[#0d1b17] dark:text-white text-3xl md:text-4xl font-black tracking-tight">Profile Overview</p>
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
                        <div className="xl:col-span-2 space-y-8">
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

            <ProfileEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
        </div>
    );
}
