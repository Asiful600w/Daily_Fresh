'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Address, saveAddress, getUserAddresses, deleteAddress, setDefaultAddress } from '@/actions/address';

interface AddressManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    initialEditAddress?: Address | null; // Pass address to edit immediately
}

export function AddressManagerModal({ isOpen, onClose, onUpdate, initialEditAddress }: AddressManagerModalProps) {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [loading, setLoading] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        label: 'Home',
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Bangladesh',
        isDefault: false
    });

    useEffect(() => {
        if (isOpen && user) {
            // Decision: If initialEditAddress is provided, jump straight to form
            if (initialEditAddress) {
                handleEdit(initialEditAddress);
            } else {
                fetchAddresses();
                setView('list'); // Default to list
            }
        }
    }, [isOpen, user, initialEditAddress]);

    const fetchAddresses = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getUserAddresses();
            setAddresses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setFormData({
            label: address.label,
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: address.isDefault
        });
        setView('form');
    };

    const handleAddNew = () => {
        setEditingAddress(null);
        setFormData({
            label: 'Home',
            fullName: user?.user_metadata?.full_name || '',
            phone: '',
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'Bangladesh',
            isDefault: addresses.length === 0
        });
        setView('form');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            await saveAddress({
                ...formData,
                id: editingAddress?.id
            });

            // If we came from external edit, close immediately
            if (initialEditAddress) {
                onUpdate();
                onClose();
            } else {
                await fetchAddresses();
                setView('list');
                onUpdate();
            }
        } catch (error) {
            alert('Failed to save address');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        setLoading(true);
        try {
            await deleteAddress(id);
            await fetchAddresses();
            onUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefault = async (id: string) => {
        if (!user) return;
        setLoading(true);
        try {
            await setDefaultAddress(id);
            await fetchAddresses();
            onUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#10221c] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-[#1e3a31] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {view === 'list' && !initialEditAddress ? 'Manage Addresses' : (editingAddress ? 'Edit Address' : 'Add New Address')}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#1e3a31] rounded-full transition-colors">
                        <span className="material-icons-round text-slate-500">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {view === 'list' && !initialEditAddress ? (
                        <div className="space-y-4">
                            <button
                                onClick={handleAddNew}
                                className="w-full py-4 border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center gap-2 text-primary font-bold hover:bg-primary/5 transition-colors"
                            >
                                <span className="material-icons-round">add</span>
                                Add New Address
                            </button>

                            {loading && <div className="text-center py-4">Loading...</div>}

                            <div className="grid gap-4">
                                {addresses.map(addr => (
                                    <div key={addr.id} className={`relative p-4 rounded-xl border ${addr.isDefault ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-[#1e3a31]'} transition-all`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-900 dark:text-white">{addr.label}</span>
                                                    {addr.isDefault && (
                                                        <span className="px-2 py-0.5 text-xs font-bold bg-primary text-white rounded-full">Default</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{addr.fullName} <span className="text-slate-400">•</span> {addr.phone}</p>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(addr)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                                    <span className="material-icons-round text-xl">edit</span>
                                                </button>
                                                <button onClick={() => handleDelete(addr.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                    <span className="material-icons-round text-xl">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                        {!addr.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(addr.id)}
                                                className="mt-3 text-sm font-bold text-slate-500 hover:text-primary transition-colors"
                                            >
                                                Set as Default
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Label (e.g. Home)" value={formData.label} onChange={v => setFormData({ ...formData, label: v })} required />
                                <FormInput label="Full Name" value={formData.fullName} onChange={v => setFormData({ ...formData, fullName: v })} required />
                            </div>
                            <FormInput label="Phone Number" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} required />
                            <FormInput label="Street Address" value={formData.street} onChange={v => setFormData({ ...formData, street: v })} required />
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="City" value={formData.city} onChange={v => setFormData({ ...formData, city: v })} required />
                                <FormInput label="State / Region" value={formData.state} onChange={v => setFormData({ ...formData, state: v })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Postal Code" value={formData.postalCode} onChange={v => setFormData({ ...formData, postalCode: v })} required />
                                <FormInput label="Country" value={formData.country} onChange={v => setFormData({ ...formData, country: v })} required />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    checked={formData.isDefault}
                                    onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="isDefault" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Set as default address
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (initialEditAddress) {
                                            onClose();
                                        } else {
                                            setView('list');
                                        }
                                    }}
                                    className="flex-1 py-3 font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                    {loading ? 'Saving...' : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

function FormInput({ label, value, onChange, required }: { label: string, value: string, onChange: (v: string) => void, required?: boolean }) {
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
        </div>
    );
}

