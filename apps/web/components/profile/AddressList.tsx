'use client';

import { Address } from '@/actions/address';

interface AddressListProps {
    addresses: Address[];
    onEdit: (address: Address) => void;
    onDelete: (id: string) => void;
    onSetDefault: (id: string) => void;
    onAddNew: () => void;
}

export function AddressList({ addresses, onEdit, onDelete, onSetDefault, onAddNew }: AddressListProps) {
    return (
        <div className="space-y-4">
            <button
                onClick={onAddNew}
                className="w-full py-6 border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center gap-2 text-primary font-bold hover:bg-primary/5 transition-colors"
            >
                <div className="bg-primary/10 p-2 rounded-full">
                    <span className="material-icons-round">add</span>
                </div>
                Add New Address
            </button>

            <div className="grid gap-4 md:grid-cols-2">
                {addresses.map(addr => (
                    <div key={addr.id} className={`relative p-5 rounded-2xl border transition-all ${addr.isDefault ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-slate-200 dark:border-[#1e3a31] bg-white dark:bg-[#10221c] hover:border-primary/50'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <span className={`text-2xl material-icons-round ${addr.isDefault ? 'text-primary' : 'text-slate-400'}`}>
                                    {addr.label.toLowerCase().includes('home') ? 'home' : (addr.label.toLowerCase().includes('work') ? 'work' : 'place')}
                                </span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 dark:text-white capitalize">{addr.label}</span>
                                        {addr.isDefault && (
                                            <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-primary text-white rounded-md tracking-wider">Default</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">{addr.fullName} • {addr.phone}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => onEdit(addr)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit Address">
                                    <span className="material-icons-round text-lg">edit</span>
                                </button>
                                <button onClick={() => onDelete(addr.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Address">
                                    <span className="material-icons-round text-lg">delete</span>
                                </button>
                            </div>
                        </div>

                        <div className="pl-10">
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                {addr.street},<br />
                                {addr.city}, {addr.state} {addr.postalCode}<br />
                                {addr.country}
                            </p>

                            {!addr.isDefault && (
                                <button
                                    onClick={() => onSetDefault(addr.id)}
                                    className="mt-4 text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1 group"
                                >
                                    <span className="material-icons-round text-sm group-hover:scale-110 transition-transform">check_circle_outline</span>
                                    Set as Default
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
