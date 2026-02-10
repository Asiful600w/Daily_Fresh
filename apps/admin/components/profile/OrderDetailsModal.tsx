'use client';

import { formatPrice } from '@/lib/format';
import NextImage from 'next/image';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
    loading?: boolean;
}

export function OrderDetailsModal({ isOpen, onClose, order, loading }: OrderDetailsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#10221c] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-[#1e3a31] flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Order Details
                        </h2>
                        {order && (
                            <p className="text-sm text-slate-500 mt-1">
                                #{order.id.slice(0, 8).toUpperCase()} • {new Date(order.created_at).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#1e3a31] rounded-full transition-colors">
                        <span className="material-icons-round text-slate-500">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
                            <p className="text-slate-500 font-medium">Loading details...</p>
                        </div>
                    ) : order ? (
                        <div className="space-y-6">
                            {/* Status Banner */}
                            <div className={`p-4 rounded-xl flex items-center gap-3 ${order.status === 'delivered' ? 'bg-[#f1f5f9] text-[#64748b]' : 'bg-[#e7f3ef] text-[#07882e]'
                                }`}>
                                <span className="material-icons-round">
                                    {order.status === 'delivered' ? 'check_circle' : 'inventory_2'}
                                </span>
                                <div>
                                    <p className="font-bold uppercase text-xs tracking-wider">Order Status</p>
                                    <p className="font-bold text-sm">
                                        {order.status === 'delivered' ? 'Delivered' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </p>
                                </div>
                            </div>

                            {/* Items List */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Items</h3>
                                <div className="space-y-3">
                                    {order.items?.map((item: any) => (
                                        <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-slate-100 dark:border-[#1e3a31] bg-slate-50/50 dark:bg-white/5">
                                            <div className="size-16 rounded-lg bg-white dark:bg-black/20 shrink-0 overflow-hidden relative">
                                                {item.image ? (
                                                    <NextImage src={item.image} alt={item.name} className="object-cover" fill sizes="64px" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                                        <span className="material-icons-round text-slate-300">image</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                                                <p className="text-xs text-slate-500 mt-1">Quantity: {item.quantity}</p>
                                                <p className="text-sm font-bold text-primary mt-1">{formatPrice(item.price)}</p>
                                            </div>
                                            <div className="text-right font-bold text-slate-900 dark:text-white">
                                                {formatPrice(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="border-t border-slate-100 dark:border-[#1e3a31] pt-4 mt-6">
                                <div className="flex justify-between items-center text-lg font-bold text-slate-900 dark:text-white">
                                    <span>Total Amount</span>
                                    <span>{formatPrice(order.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            Failed to load order details.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-[#1e3a31] bg-slate-50/50 dark:bg-white/5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
