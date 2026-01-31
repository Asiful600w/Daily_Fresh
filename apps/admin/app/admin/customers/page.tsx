'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCustomers } from '@/lib/api';

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getCustomers(searchQuery);
            setCustomers(data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-text-main">Customers</h1>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">search</span>
                        <input
                            type="text"
                            placeholder="Search by phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-subtle bg-white dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold whitespace-nowrap">
                        {customers.length} Users
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-700 text-text-muted text-[11px] uppercase tracking-wider font-bold border-b border-border-subtle">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-text-muted">Loading...</td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-text-muted">No customers found.</td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    {customer.avatar_url ? (
                                                        <img src={customer.avatar_url} alt={customer.full_name || 'User'} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-gray-400">person</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text-main">{customer.full_name || 'Unknown User'}</p>
                                                    {customer.username && <p className="text-xs text-text-muted">@{customer.username}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-muted">
                                            {customer.phone || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-muted">
                                            {customer.created_at || customer.updated_at ? new Date(customer.created_at || customer.updated_at).toLocaleDateString('en-US') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/customers/${customer.id}`} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors">
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
