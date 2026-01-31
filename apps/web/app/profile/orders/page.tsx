'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { getUserOrders } from '@/lib/api';
import { formatPrice } from '@/lib/format';

export default function MyOrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchOrders();
        }
    }, [user, authLoading]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getUserOrders(user!.id);
            if (data) {
                setOrders(data);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
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
                <ProfileSidebar activeTab="orders" />

                <main className="flex flex-col flex-1 p-4 md:p-8">
                    {/* Header */}
                    <div className="mb-8">

                        <h1 className="text-[#0d1b17] dark:text-white text-3xl font-black tracking-tight">My Orders</h1>
                        <p className="text-[#4c9a80] text-base font-normal mt-1">
                            Track, view, and manage all your past orders.
                        </p>
                    </div>

                    {/* Orders List */}
                    {orders.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 bg-white dark:bg-[#10221c] rounded-3xl border border-[#cfe7df] dark:border-[#1e3a31]">
                            <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-icons-round text-4xl text-slate-400">shopping_bag</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#0d1b17] dark:text-white mb-2">No orders yet</h3>
                            <p className="mb-6">You haven't placed any orders yet.</p>
                            <Link href="/" className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="flex flex-col md:flex-row md:items-center gap-4 p-6 rounded-3xl bg-white dark:bg-[#10221c] border border-[#cfe7df] dark:border-[#1e3a31] transition-transform hover:scale-[1.01] duration-300">
                                    {/* Icon */}
                                    <div className="size-16 rounded-2xl bg-[#f0f9f6] dark:bg-[#1e3a31] flex items-center justify-center shrink-0">
                                        <span className={`material-icons-round text-3xl ${order.status === 'delivered' ? 'text-[#4c9a80]' : 'text-primary'}`}>
                                            {order.status === 'delivered' ? 'check_circle' : 'shopping_basket'}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg text-[#0d1b17] dark:text-white">
                                                Order #{order.id.slice(0, 8).toUpperCase()}
                                            </h3>
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-[#f1f5f9] text-[#64748b]' : 'bg-[#e7f3ef] text-[#07882e]'}`}>
                                                {order.status === 'delivered'
                                                    ? `Delivered ${new Date(order.created_at).toLocaleDateString()}`
                                                    : order.status === 'pending'
                                                        ? 'Pending'
                                                        : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-[#4c9a80] font-medium mt-1">
                                            {order.item_count || 0} items • {formatPrice(order.total_amount)}
                                        </p>
                                    </div>

                                    {/* Action */}
                                    <div className="flex items-center gap-3 mt-2 md:mt-0">
                                        <button onClick={() => router.push(`/orders/${order.id}`)} className="px-6 py-2.5 rounded-xl bg-[#e7f3ef] dark:bg-[#1e3a31] hover:bg-[#d5ebe5] dark:hover:bg-[#2a4d42] text-sm font-bold text-[#0d1b17] dark:text-white transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
