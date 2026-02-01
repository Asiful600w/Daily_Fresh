'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
    });

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                fullName: user.user_metadata?.full_name || '',
                phone: user.phone || user.user_metadata?.phone || '',
            });
        }
    }, [isOpen, user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Basic Phone Validation
        let phone = formData.phone.trim();
        // Ensure it starts with +88 if it looks like a Bangladeshi number (11 digits starting with 01, or 13 digits starting with 880)
        if (phone.startsWith('01') && phone.length === 11) {
            phone = '+88' + phone;
        } else if (phone.startsWith('880')) {
            phone = '+' + phone;
        }

        // Simple check for +88 prefix as per requirements implied in previous tasks
        // If the user didn't enter a +88 prefix, we might want to warn or auto-fix, 
        // but given "just edit profile button should work", let's be loose but consistent with the checkout flow.

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                phone: phone, // Updating phone in Auth
                data: {
                    full_name: formData.fullName,
                    phone: phone // Also keeping it in metadata just in case
                }
            });

            if (error) throw error;

            router.refresh(); // Refresh to update UI
            onClose();
        } catch (error: any) {
            alert('Failed to update profile: ' + error.message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#10221c] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-[#1e3a31] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Edit Profile
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#1e3a31] rounded-full transition-colors">
                        <span className="material-icons-round text-slate-500">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <form onSubmit={handleSave} className="space-y-4">
                        <FormInput
                            label="Full Name"
                            value={formData.fullName}
                            onChange={v => setFormData({ ...formData, fullName: v })}
                            required
                        />
                        <FormInput
                            label="Phone Number"
                            value={formData.phone}
                            onChange={v => setFormData({ ...formData, phone: v })}
                            required
                            helpText="Format: +880..."
                        />

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} className="flex-1 py-3 font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function FormInput({ label, value, onChange, required, helpText }: { label: string, value: string, onChange: (v: string) => void, required?: boolean, helpText?: string }) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                required={required}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-medium"
            />
            {helpText && <p className="text-xs text-slate-400 mt-1">{helpText}</p>}
        </div>
    );
}
