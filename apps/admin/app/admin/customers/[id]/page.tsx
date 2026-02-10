'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCustomerById, getUserOrders } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { useCallback } from 'react';

interface Props {
    params: Promise<{ id: string }>;
}

export default function CustomerDetailsPage({ params }: Props) {
    const [id, setId] = useState<string>('');
    useEffect(() => {
        params.then(p => setId(p.id));
    }, [params]);

    const [customer, setCustomer] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (userId: string) => {
        try {
            const [custData, ordersData] = await Promise.all([
                getCustomerById(userId),
                getUserOrders(userId)
            ]);
            setCustomer(custData);
            setOrders(ordersData);
        } catch (error) {
            console.error('Failed to fetch customer details', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id, fetchData]);

    if (loading) return <div className="p-8 text-center text-text-muted">Loading details...</div>;
    if (!customer) return <div className="p-8 text-center text-text-muted">Customer not found.</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header / Back Link */}
            <div className="flex items-center gap-4">
                <Link href="/admin/customers" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-text-muted">arrow_back</span>
                </Link>
                <h1 className="text-2xl font-bold text-text-main">Customer Profile</h1>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border-subtle p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="w-32 h-32 relative rounded-full overflow-hidden bg-gray-100 shrink-0 border-4 border-white dark:border-slate-700 shadow-lg">
                    {customer.avatar_url ? (
                        <NextImage src={customer.avatar_url} alt={customer.full_name} className="object-cover" fill sizes="128px" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-5xl">person</span>
                        </div>
                    )}
                </div>
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                        <h2 className="text-3xl font-bold text-text-main">{customer.full_name || 'Unknown User'}</h2>
                        {customer.username && <p className="text-lg text-text-muted">@{customer.username}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-border-subtle">
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Phone</p>
                            <p className="text-text-main font-medium">{customer.phone || 'N/A'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-border-subtle">
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Joined</p>
                            <p className="text-text-main font-medium">
                                {customer.created_at || customer.updated_at ? new Date(customer.created_at || customer.updated_at).toLocaleDateString('en-US') : 'N/A'}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-border-subtle">
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Total Orders</p>
                            <p className="text-2xl font-bold text-primary">{orders.length}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-border-subtle">
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Total Spent</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatPrice(orders.reduce((sum, o) => sum + (o.total_amount || 0), 0))}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order History */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-text-main px-2">Order History</h3>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-slate-700 text-text-muted text-[11px] uppercase tracking-wider font-bold border-b border-border-subtle">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-text-muted">No orders found.</td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm text-text-muted">
                                                #{order.id.toString().slice(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-muted">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-text-main">
                                                {formatPrice(order.total_amount)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
