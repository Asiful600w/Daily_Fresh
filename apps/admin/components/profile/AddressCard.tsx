'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Address, getUserAddresses } from '@/lib/api';
import { AddressManagerModal } from './AddressManagerModal';

export function AddressCard() {
    const { user } = useAuth();
    const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAddress = async () => {
        if (!user) return;
        const addresses = await getUserAddresses(user.id);
        const def = addresses.find(a => a.isDefault) || addresses[0] || null;
        setDefaultAddress(def);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAddress();
    }, [user]);

    return (
        <>
            <div className="p-6 rounded-2xl bg-white dark:bg-[#10221c] border border-[#cfe7df] dark:border-[#1e3a31] shadow-sm">
                <h3 className="font-bold text-[#0d1b17] dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-primary">home_pin</span>
                    Default Address
                </h3>

                {defaultAddress ? (
                    <>
                        <p className="text-sm font-bold text-[#0d1b17] dark:text-white">{defaultAddress.label}</p>
                        <p className="text-sm text-[#4c9a80] mt-1 leading-relaxed">
                            {defaultAddress.street}<br />
                            {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}<br />
                            {defaultAddress.country}
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-slate-500 italic">No address saved.</p>
                )}

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 text-xs font-bold text-primary hover:underline hover:cursor-pointer"
                >
                    Manage Addresses
                </button>
            </div>

            <AddressManagerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={fetchAddress}
            />
        </>
    );
}
