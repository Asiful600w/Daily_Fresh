'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdminOrder, updateAdminOrderStatus } from '@/lib/adminApi';
import { formatPrice } from '@/lib/format';
import Link from 'next/link';

export default function AdminOrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = useCallback(async () => {
        try {
            const data = await getAdminOrder(id as string);
            if (data) {
                setOrder(data);
            } else {
                router.push('/admin/orders');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            await updateAdminOrderStatus(id as string, newStatus);
            setOrder({ ...order, status: newStatus });
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        }
    };

    if (loading || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-primary transition-colors mb-2">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back to Orders
                    </Link>
                    <h1 className="text-3xl font-bold text-text-main">Order #{order.id.slice(0, 8)}</h1>
                    <p className="text-text-muted">
                        Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className="text-sm font-bold border border-border-subtle rounded-lg px-4 py-2 bg-white text-text-main focus:ring-primary focus:border-primary cursor-pointer"
                    >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border-subtle shadow-sm overflow-hidden p-6">
                        <h2 className="text-lg font-bold text-text-main mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0 relative">
                                        {/* Prioritize current product image (index 0), then snapshot image */}
                                        {(item.products?.images && item.products.images.length > 0) || item.image ? (
                                            <img
                                                src={item.products?.images?.[0] || item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <span className="material-symbols-outlined">image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-text-main line-clamp-1">{item.name}</h3>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <p className="text-sm text-text-muted">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                            <div className="flex gap-3 text-xs">
                                                {item.size && (
                                                    <span className="font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                                        Size: {item.size}
                                                    </span>
                                                )}
                                                {item.color && (
                                                    <span className="font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                                        Color: {item.color}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right font-bold text-text-main">
                                        {formatPrice(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-border-subtle mt-6 pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Subtotal</span>
                                <span className="font-bold text-text-main">{formatPrice(order.total_amount / 1.05)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Tax</span>
                                <span className="font-bold text-text-main">{formatPrice(order.total_amount - (order.total_amount / 1.05))}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2">
                                <span className="text-text-main">Total</span>
                                <span className="text-primary">{formatPrice(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border-subtle shadow-sm p-6">
                        <h3 className="text-lg font-bold text-text-main mb-4">Customer Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-text-muted uppercase font-bold">Name</label>
                                <p className="text-sm font-medium text-text-main">{order.customer?.name || order.shipping_name}</p>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted uppercase font-bold">Phone</label>
                                <p className="text-sm font-medium text-text-main flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base text-text-muted">phone</span>
                                    {order.customer?.phone || order.shipping_phone}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted uppercase font-bold">Address</label>
                                <p className="text-sm font-medium text-text-main">{order.shipping_address}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border-subtle shadow-sm p-6">
                        <h3 className="text-lg font-bold text-text-main mb-4">Payment</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-text-muted uppercase font-bold">Method</label>
                                <p className="text-sm font-medium text-text-main uppercase">{order.payment_method}</p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
