'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';


export function MerchantProfileSettings() {
    const { adminUser, setAdminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: adminUser?.full_name || '',
        shop_name: adminUser?.shop_name || '',
        phone: adminUser?.phone || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminUser) return;

        setLoading(true);
        try {
            const { updateMerchantProfileAction } = await import('@/actions/merchant');

            const result = await updateMerchantProfileAction({
                id: adminUser.id,
                full_name: formData.full_name,
                shop_name: formData.shop_name,
                phone: formData.phone
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            // Update local context
            setAdminUser({ ...adminUser, ...formData });
            alert('Profile updated successfully!');

        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-icons-round text-primary">storefront</span>
                Merchant Profile Settings
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Name</label>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="John Doe"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Shop Name</label>
                    <input
                        type="text"
                        name="shop_name"
                        value={formData.shop_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="My Awesome Shop"
                    />
                    <p className="text-xs text-slate-500">This name will be displayed on your products page.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="+8801..."
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
