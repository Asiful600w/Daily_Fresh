'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminOrders, updateAdminOrderStatus } from '@/lib/adminApi';
import { formatPrice } from '@/lib/format';

import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminOrdersPage() {
    const { adminUser } = useAdminAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, adminUser]);

    const fetchOrders = async () => {
        if (!adminUser) return;
        try {
            setLoading(true);
            const merchantId = adminUser.role === 'MERCHANT' ? adminUser.id : undefined;
            const data = await getAdminOrders(searchQuery, merchantId);
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateAdminOrderStatus(id, newStatus);
            // Optimistic update
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status.toLowerCase() === filter.toLowerCase();
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'processing': return 'bg-blue-100 text-blue-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-text-main">Order Management</h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                    <div className="relative w-full sm:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">search</span>
                        <input
                            type="text"
                            placeholder="Search by Order ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-subtle bg-white dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        {['All', 'Pending', 'Processing', 'Delivered'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f.toLowerCase())}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${filter === f.toLowerCase()
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-text-muted hover:bg-gray-100 border border-border-subtle'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-700 text-text-muted text-[11px] uppercase tracking-wider font-bold border-b border-border-subtle">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-text-muted">Loading orders...</td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-text-muted">No orders found.</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-text-main">#{order.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-text-main">{order.customer?.name || order.shipping_name || 'Guest'}</span>
                                                <span className="text-xs text-text-muted">{order.customer?.phone || order.shipping_phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-muted">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-muted max-w-xs truncate" title={order.items_summary}>
                                            {order.items_summary}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-text-main">{formatPrice(order.total_amount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                    className="text-xs border border-border-subtle rounded-lg px-2 py-1 bg-white text-text-main focus:ring-primary focus:border-primary cursor-pointer"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="p-1 text-text-muted hover:text-primary transition-colors"
                                                    title="View Details"
                                                >
                                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}
