'use client';
import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { getMerchants, updateMerchantStatus } from '@/lib/api';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

type AdminUser = {
    id: string;
    email: string;
    full_name: string;
    shop_name?: string;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    role: 'SUPERADMIN' | 'MERCHANT' | 'CUSTOMER';
    created_at: string;
    phone?: string;
};

export default function MerchantsPage() {
    const { adminUser, adminLoading } = useAdminAuth();
    const router = useRouter();
    const [merchants, setMerchants] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!adminLoading) {
            if (!adminUser) {
                router.push('/admin/login');
            } else {
                fetchMerchants();
            }
        }
        // Removed strict role check redirect here to allow debugging if role is slightly off
    }, [adminUser, adminLoading]);


    const fetchMerchants = async () => {
        try {
            setLoading(true);
            const data = await getMerchants();
            setMerchants(data as any[]); // Cast to match AdminUser type if slight mismatch
        } catch (error) {
            console.error('Error fetching merchants:', error);
            // Optional: set error state
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await updateMerchantStatus(id, newStatus);
            // Optimistic update
            setMerchants(merchants.map(m => m.id === id ? { ...m, status: newStatus as any } : m));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    if (loading || adminLoading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (adminUser?.role !== 'SUPERADMIN') return null;

    return (
        <div className="p-6 md:p-10">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Merchant Management</h1>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-left">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Merchant</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Role</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Status</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Joined</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {merchants.map((merchant) => (
                                <tr key={merchant.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{merchant.shop_name || merchant.full_name || 'No Name'}</p>
                                            <p className="text-sm text-slate-500">{merchant.email}</p>
                                            <p className="text-xs text-slate-400">Owner: {merchant.full_name}</p>
                                            {merchant.phone && <p className="text-xs text-slate-400">{merchant.phone}</p>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${merchant.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {merchant.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`
                                            text-xs font-bold px-2 py-1 rounded uppercase
                                            ${merchant.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                merchant.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'}
                                        `}>
                                            {merchant.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500">
                                        {new Date(merchant.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        {merchant.role !== 'SUPERADMIN' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/products?merchant_id=${merchant.id}`}
                                                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                                                >
                                                    <span className="material-icons-round text-sm">inventory_2</span>
                                                    View Products
                                                </Link>
                                                {merchant.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(merchant.id, 'approved')}
                                                            className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(merchant.id, 'rejected')}
                                                            className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {merchant.status === 'approved' && (
                                                    <button
                                                        onClick={() => updateStatus(merchant.id, 'suspended')}
                                                        className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                                {(merchant.status === 'rejected' || merchant.status === 'suspended') && (
                                                    <button
                                                        onClick={() => updateStatus(merchant.id, 'approved')}
                                                        className="px-3 py-1.5 bg-slate-500 text-white text-xs font-bold rounded-lg hover:bg-slate-600 transition-colors"
                                                    >
                                                        Re-activate
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
