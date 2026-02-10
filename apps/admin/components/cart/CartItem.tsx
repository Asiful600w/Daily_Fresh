'use client';

import { useCart, CartItem as CartItemType } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import Link from 'next/link';
import NextImage from 'next/image';

interface CartItemProps {
    item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCart();

    // Map category to color roughly matching the HTML example logic
    const categoryColor =
        item.category === 'Organic' ? 'text-primary' :
            item.category === 'Dairy' ? 'text-blue-500' :
                item.category === 'Bakery' ? 'text-orange-500' : 'text-gray-500';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 flex items-center gap-6 group transition-all hover:border-primary/20">
            {/* Image */}
            <div className="w-24 h-24 rounded-lg bg-slate-50 dark:bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-600 relative">
                <Link href={`/product/${item.id}`}>
                    <NextImage
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                        alt={item.name}
                        src={item.images && item.images.length > 0 ? item.images[0] : ''}
                        fill
                        sizes="96px"
                    />
                </Link>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col gap-1">
                {item.category && (
                    <span className={`text-xs font-bold ${categoryColor} uppercase tracking-wider`}>{item.category}</span>
                )}
                <Link href={`/product/${item.id}`}>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-primary transition-colors">{item.name}</h3>
                </Link>
                {item.pack && <p className="text-sm text-slate-500 dark:text-slate-400">{item.pack}</p>}

                {/* Mobile Controls */}
                <div className="mt-2 flex items-center lg:hidden gap-4">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all text-slate-500 dark:text-slate-400"
                        >
                            <span className="material-icons-round text-sm">remove</span>
                        </button>
                        <span className="w-8 text-center font-bold text-slate-900 dark:text-white font-mono">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all text-primary"
                        >
                            <span className="material-icons-round text-sm">add</span>
                        </button>
                    </div>
                </div>

                {/* Desktop Controls (Quantity) */}
                <div className="mt-2 hidden lg:flex items-center gap-4">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all text-slate-500 dark:text-slate-400"
                        >
                            <span className="material-icons-round text-sm">remove</span>
                        </button>
                        <span className="w-8 text-center font-bold text-slate-900 dark:text-white font-mono">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all text-primary"
                        >
                            <span className="material-icons-round text-sm">add</span>
                        </button>
                    </div>
                </div>

            </div>

            {/* Price & Remove (Desktop) */}
            <div className="hidden lg:flex flex-col items-end gap-1 min-w-[100px]">
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{formatPrice(item.price * item.quantity)}</span>
                <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 group/delete"
                >
                    <span className="material-icons-round text-sm group-hover/delete:animate-bounce">delete</span>
                    Remove
                </button>
            </div>
            {/* Price & Remove (Mobile) */}
            <div className="flex lg:hidden flex-col items-end gap-1">
                <span className="text-lg font-bold text-slate-900 dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 bg-red-50 text-red-500 rounded-full"
                >
                    <span className="material-icons-round text-sm">delete</span>
                </button>
            </div>
        </div>
    );
}
