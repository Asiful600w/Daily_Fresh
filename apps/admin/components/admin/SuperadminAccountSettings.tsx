'use client';

import { useState, useTransition } from 'react';
import { updateSuperadminCredentials } from '@/actions/update-credentials';
import { useAdminAuth } from '@/context/AdminAuthContext';

export function SuperadminAccountSettings() {
    const { adminUser } = useAdminAuth();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const [formData, setFormData] = useState({
        currentPassword: '',
        newEmail: adminUser?.email || '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(undefined);
        setSuccess(undefined);

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        startTransition(async () => {
            const result = await updateSuperadminCredentials({
                currentPassword: formData.currentPassword,
                newEmail: formData.newEmail || undefined,
                newPassword: formData.newPassword || undefined,
                confirmPassword: formData.confirmPassword || undefined
            });

            if (result.error) {
                setError(result.error);
            } else if (result.success) {
                setSuccess(result.success);
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
            }
        });
    };

    if (adminUser?.role !== 'SUPERADMIN') {
        return null;
    }

    return (
        <div className="bg-white dark:bg-[#10221c] rounded-2xl shadow-sm border border-slate-100 dark:border-[#1e3a31] p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="material-icons-round text-purple-600 dark:text-purple-400">admin_panel_settings</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Superadmin Account</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Update your email or password</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Current Email Display */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Current Email
                    </label>
                    <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0b1a15] border border-slate-200 dark:border-[#1e3a31] text-slate-600 dark:text-slate-400">
                        {adminUser?.email}
                    </div>
                </div>

                {/* New Email */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        New Email (optional)
                    </label>
                    <input
                        type="email"
                        value={formData.newEmail}
                        onChange={(e) => setFormData({ ...formData, newEmail: e.target.value })}
                        disabled={isPending}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#1e3a31] bg-white dark:bg-[#0b1a15] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                        placeholder="Leave blank to keep current email"
                    />
                </div>

                <hr className="border-slate-100 dark:border-[#1e3a31]" />

                {/* New Password */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        New Password (optional)
                    </label>
                    <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        disabled={isPending}
                        minLength={6}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#1e3a31] bg-white dark:bg-[#0b1a15] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                        placeholder="Leave blank to keep current password"
                    />
                </div>

                {/* Confirm Password */}
                {formData.newPassword && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            disabled={isPending}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#1e3a31] bg-white dark:bg-[#0b1a15] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                            placeholder="Confirm your new password"
                        />
                    </div>
                )}

                <hr className="border-slate-100 dark:border-[#1e3a31]" />

                {/* Current Password - Required for any changes */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        disabled={isPending}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#1e3a31] bg-white dark:bg-[#0b1a15] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                        placeholder="Enter current password to confirm changes"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Required to make any changes
                    </p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <span className="material-icons-round text-lg">error</span>
                            {error}
                        </p>
                    </div>
                )}

                {success && (
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                            <span className="material-icons-round text-lg">check_circle</span>
                            {success}
                        </p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isPending || !formData.currentPassword}
                    className="w-full py-3 px-6 bg-primary hover:bg-[#3d8b72] text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <span className="material-icons-round animate-spin text-lg">refresh</span>
                            Updating...
                        </>
                    ) : (
                        <>
                            <span className="material-icons-round text-lg">save</span>
                            Save Changes
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
