'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Address, getUserAddresses, deleteAddress, setDefaultAddress } from '@/actions/address';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { AddressList } from '@/components/profile/AddressList';
import { AddressManagerModal } from '@/components/profile/AddressManagerModal';

export default function AddressesPage() {
    const { user, loading: authLoading } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

    const fetchAddresses = useCallback(async () => {
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
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user, fetchAddresses]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await deleteAddress(id);
            await fetchAddresses();
        } catch (error) {
            console.error(error);
        }
    };

    const handleSetDefault = async (id: string) => {
        if (!user) return;
        try {
            await setDefaultAddress(id);
            await fetchAddresses();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (addr: Address) => {
        setAddressToEdit(addr);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setAddressToEdit(null);
        setIsModalOpen(true);
    };

    if (authLoading) return null;

    return (
        <div className="flex justify-center bg-background-light dark:bg-background-dark min-h-screen">
            <div className="flex w-full max-w-[1280px]">
                <ProfileSidebar activeTab="addresses" />

                <main className="flex flex-col flex-1 p-4 md:p-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/profile" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full lg:hidden block">
                            <span className="material-icons-round text-slate-500">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-[#0d1b17] dark:text-white text-3xl font-black tracking-tight">Saved Addresses</h1>
                            <p className="text-[#4c9a80] text-sm mt-1">Manage your shipping addresses for faster checkout</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <AddressList
                                addresses={addresses}
                                onAddNew={handleAddNew}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onSetDefault={handleSetDefault}
                            />
                        )}
                    </div>
                </main>
            </div>

            <AddressManagerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={fetchAddresses}
                initialEditAddress={addressToEdit}
            />
        </div>
    );
}
