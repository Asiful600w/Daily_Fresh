'use client';

import { useCart, CartItem as CartItemType } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import Link from 'next/link';

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
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 group transition-all hover:border-primary/20 relative">

            {/* Remove Button Mobile (Absolute Top Right) */}
            <button
                onClick={() => removeItem(item.id)}
                className="absolute top-4 right-4 p-1 text-slate-300 hover:text-red-500 md:hidden"
            >
                <span className="material-icons-round text-lg">close</span>
            </button>

            <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Image */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-slate-50 dark:bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-600">
                    <Link href={`/product/${item.id}`}>
                        <img
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                            alt={item.name}
                            src={item.images && item.images.length > 0 ? item.images[0] : ''}
                        />
                    </Link>
                </div>

                {/* Info (Mobile & Desktop) */}
                <div className="flex flex-1 flex-col gap-1 pr-8 md:pr-0">
                    {item.category && (
                        <span className={`text-[10px] md:text-xs font-bold ${categoryColor} uppercase tracking-wider`}>{item.category}</span>
                    )}
                    <Link href={`/product/${item.id}`}>
                        <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white line-clamp-2 md:line-clamp-1 hover:text-primary transition-colors leading-tight">{item.name}</h3>
                    </Link>
                    {item.pack && <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">{item.pack}</p>}
                </div>
            </div>

            {/* Controls & Price Wrapper */}
            <div className="flex items-center justify-between w-full md:w-auto md:flex-1 md:justify-end gap-6">
                {/* Quantity Controls */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all text-slate-500 dark:text-slate-400"
                    >
                        <span className="material-icons-round text-sm">remove</span>
                    </button>
                    <span className="w-8 text-center font-bold text-slate-900 dark:text-white font-mono text-sm">{item.quantity}</span>
                    <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all text-primary"
                    >
                        <span className="material-icons-round text-sm">add</span>
                    </button>
                </div>

                {/* Price & Remove (Desktop) */}
                <div className="flex flex-col items-end gap-1 min-w-[80px]">
                    <span className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">{formatPrice(item.price * item.quantity)}</span>
                    <button
                        onClick={() => removeItem(item.id)}
                        className="hidden md:flex text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors items-center gap-1 group/delete"
                    >
                        <span className="material-icons-round text-sm group-hover/delete:animate-bounce">delete</span>
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}
