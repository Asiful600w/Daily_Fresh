'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatPrice } from '@/lib/format';
import { getOrder } from '@/lib/api';
import { OrderDetailsModal } from './OrderDetailsModal';

export function RecentOrders({ orders }: { orders: any[] }) {
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleViewDetails = async (orderId: string) => {
        setIsModalOpen(true);
        setIsLoading(true);
        try {
            const data = await getOrder(orderId);
            setSelectedOrder(data);
        } catch (error) {
            console.error('Failed to fetch order details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!orders || orders.length === 0) {
        return (
            <div className="xl:col-span-2 flex flex-col gap-4">
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-[#0d1b17] dark:text-white text-xl font-bold">Recent Orders</h2>
                </div>
                <div className="p-8 text-center text-slate-500 bg-white dark:bg-[#10221c] rounded-2xl border border-[#cfe7df] dark:border-[#1e3a31]">
                    No recent orders found.
                </div>
            </div>
        );
    }

    return (
        <div className="xl:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-[#0d1b17] dark:text-white text-xl font-bold">Recent Orders</h2>
                <Link href="/profile/orders" className="text-primary text-sm font-bold hover:underline">View all</Link>
            </div>
            <div className="flex flex-col gap-3">
                {orders.map((order) => (
                    <div key={order.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#10221c] border border-[#cfe7df] dark:border-[#1e3a31]">
                        <div className="size-16 rounded-xl bg-[#f0f9f6] dark:bg-[#1e3a31] flex items-center justify-center">
                            <span className={`material-icons-round text-3xl ${order.status === 'delivered' ? 'text-[#4c9a80]' : 'text-primary'}`}>
                                {order.status === 'delivered' ? 'check_circle' : 'shopping_basket'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between flex-wrap gap-2">
                                <h3 className="font-bold text-[#0d1b17] dark:text-white">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${order.status === 'delivered' ? 'bg-[#f1f5f9] text-[#64748b]' : 'bg-[#e7f3ef] text-[#07882e]'}`}>
                                    {order.status === 'delivered'
                                        ? `Delivered ${new Date(order.created_at).toLocaleDateString()}`
                                        : order.status === 'pending'
                                            ? 'Pending'
                                            : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </div>
                            <p className="text-sm text-[#4c9a80] mt-1">
                                {order.item_count || 0} items • {formatPrice(order.total_amount)}
                            </p>
                        </div>
                        <button
                            onClick={() => handleViewDetails(order.id)}
                            className="px-4 py-2 rounded-lg bg-[#e7f3ef] dark:bg-[#1e3a31] hover:bg-[#d5ebe5] dark:hover:bg-[#2a4d42] text-xs font-bold shrink-0 text-[#0d1b17] dark:text-white transition-colors"
                        >
                            View Details
                        </button>
                    </div>
                ))}
            </div>

            <OrderDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
                loading={isLoading}
            />
        </div>
    );
}
