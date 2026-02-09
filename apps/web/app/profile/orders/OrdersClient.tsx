'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { formatPrice } from '@/lib/format';

interface OrdersClientProps {
    initialOrders: any[];
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
    const [activeStatus, setActiveStatus] = useState('all');

    const filteredOrders = activeStatus === 'all'
        ? initialOrders
        : initialOrders.filter(order => order.status.toLowerCase() === activeStatus);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    return (
        <div className="flex justify-center bg-background-light dark:bg-background-dark min-h-screen">
            <div className="flex w-full max-w-[1280px]">
                <ProfileSidebar activeTab="orders" />

                <main className="flex flex-col flex-1 p-4 md:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-[#0d1b17] dark:text-white text-3xl font-black tracking-tight">My Orders</h1>
                        <p className="text-[#4c9a80] text-base font-normal mt-1">
                            Track and manage your recent purchases.
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                        {['all', 'pending', 'processing', 'on_delivery', 'delivered', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setActiveStatus(status)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeStatus === status
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 bg-white dark:bg-[#10221c] rounded-3xl border border-[#cfe7df] dark:border-[#1e3a31]">
                            <span className="material-icons-round text-6xl text-slate-300 dark:text-slate-600 mb-4">shopping_bag</span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {activeStatus === 'all' ? 'No orders found' : `No ${activeStatus} orders`}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">Start shopping to see your orders here!</p>
                            <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">

                                        {/* Left: Icon & Basic Info */}
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${order.status === 'delivered' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-primary/10 text-primary'}`}>
                                                <span className="material-icons-round text-xl">
                                                    {order.status === 'delivered' ? 'check_circle' : 'shopping_bag'}
                                                </span>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                                        #{order.id}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {new Date(order.created_at).toLocaleDateString()} • {order.order_items?.length || 0} items
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right: Price & Images */}
                                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">

                                            {/* Preview Images (Tiny) */}
                                            <div className="flex -space-x-2">
                                                {order.order_items?.slice(0, 3).map((item: any, idx: number) => (
                                                    <div key={idx} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="material-icons-round text-[10px] text-slate-400 flex items-center justify-center w-full h-full">image</span>
                                                        )}
                                                    </div>
                                                ))}
                                                {(order.order_items?.length || 0) > 3 && (
                                                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                        +{order.order_items.length - 3}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right min-w-[80px]">
                                                <span className="block font-black text-slate-900 dark:text-white text-sm">
                                                    {formatPrice(order.total_amount)}
                                                </span>
                                            </div>

                                            <Link
                                                href={`/orders/${order.id}`} // Fixed Link
                                                className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                            >
                                                <span className="material-icons-round text-lg">chevron_right</span>
                                            </Link>
                                        </div>
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
