'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/format';
import { useFlyToCart } from '@/context/FlyToCartContext';

export interface Product {
    id: number | string;
    name: string;
    price: number;
    images: string[];
    category?: string;
    quantity?: string; // Display quantity e.g. "1kg"
    originalPrice?: number;
    discountPercent?: number;
    specialCategoryLabel?: string;
    description?: string;
    stockQuantity?: number;
}

interface ProductCardProps {
    product: Product;
    variant?: 'default' | 'wishlist';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
    const { addItem } = useCart();
    const { user } = useAuth();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { triggerFly } = useFlyToCart();
    const isOutOfStock = product.stockQuantity === 0;
    const MAX_QUANTITY = 99; // Prevent abuse

    // Local state for quantity
    const [quantity, setQuantity] = React.useState(1);

    const isWishlisted = isInWishlist(Number(product.id));

    const handleWishlistClick = React.useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert("Please sign in to add items to your wishlist.");
            return;
        }

        if (isWishlisted) {
            await removeFromWishlist(Number(product.id));
        } else {
            await addToWishlist(Number(product.id));
        }
    }, [isWishlisted, product.id, user, addToWishlist, removeFromWishlist]);

    const handleDeleteClick = React.useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await removeFromWishlist(Number(product.id));
    }, [product.id, removeFromWishlist]);

    const handleIncrement = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setQuantity(prev => {
            const stockMax = product.stockQuantity !== undefined ? product.stockQuantity : MAX_QUANTITY;
            return Math.min(prev + 1, stockMax, MAX_QUANTITY);
        });
    }, [product.stockQuantity]);

    const handleDecrement = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) return;
        setQuantity(prev => Math.max(1, prev - 1));
    }, [isOutOfStock]);

    const handleAddToCart = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock) return;

        addItem({
            id: String(product.id),
            name: product.name,
            price: product.price,
            images: product.images || [],
            quantity: quantity,
            category: product.category,
            pack: product.quantity,
            color: ''
        });

        const imageSrc = product.images && product.images.length > 0 ? product.images[0] : '/placeholder-food.png';
        triggerFly(e.currentTarget as HTMLElement, imageSrc, quantity);
    }, [isOutOfStock, product, quantity, addItem, triggerFly]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 border border-slate-100 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group relative h-full flex flex-col">
            {/* Image & Badges Container */}
            <div className="relative aspect-square w-full mb-2 sm:mb-4 group-hover:scale-[1.03] transition-transform duration-500 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden">
                <Link href={`/product/${product.id}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`} />

                {product.images && product.images.length > 0 && product.images[0] ? (
                    <Image
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain relative z-0 pointer-events-none p-3 sm:p-4"
                        src={product.images[0]}
                    />
                ) : (
                    <span className="material-symbols-outlined text-4xl text-gray-300 relative z-0">image</span>
                )}

                {/* Badges */}
                <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1 z-10 pointer-events-none">
                    {product.discountPercent && product.discountPercent > 0 && (
                        <div className="bg-red-500 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-sm">
                            {product.discountPercent}% OFF
                        </div>
                    )}
                    {product.specialCategoryLabel && (
                        <div className="bg-yellow-400 text-slate-900 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-sm">
                            {product.specialCategoryLabel}
                        </div>
                    )}
                </div>

                {/* Wishlist Button - top right on image */}
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10">
                    <div className="transition-all duration-300 transform md:translate-x-2 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100">
                        {variant === 'wishlist' ? (
                            <button
                                onClick={handleDeleteClick}
                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm transition-all text-red-500 hover:text-red-600 hover:bg-white cursor-pointer"
                                title="Remove from wishlist"
                            >
                                <span className="material-icons-round text-base sm:text-lg">delete_outline</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleWishlistClick}
                                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full backdrop-blur-sm shadow-sm transition-all cursor-pointer
                                    ${isWishlisted
                                        ? 'bg-red-50 dark:bg-red-500/20 text-red-500 scale-110'
                                        : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-white'}`}
                            >
                                <span className={`material-icons-round text-base sm:text-lg ${isWishlisted ? '' : 'material-icons-outlined'}`}>
                                    {isWishlisted ? 'favorite' : 'favorite_border'}
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-4">
                        <span className="bg-red-500 text-white text-[9px] sm:text-[10px] font-black px-3 py-1.5 rounded-full shadow-xl uppercase tracking-widest transform -rotate-12 border-2 border-white/20">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col relative px-0.5 sm:px-1 min-w-0">
                <Link href={`/product/${product.id}`} className="absolute inset-0 z-0" />

                {/* Category & Name */}
                <div className="relative z-10 pointer-events-none mb-1">
                    {product.category && (
                        <p className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.08em] mb-0.5">{product.category}</p>
                    )}
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </div>

                {/* Quantity Tag */}
                {product.quantity && (
                    <div className="relative z-10 pointer-events-none mb-1">
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500">{product.quantity}</p>
                    </div>
                )}

                {/* Price + Action - pushed to bottom */}
                <div className="mt-auto pt-2 sm:pt-3 relative z-20 space-y-2 sm:space-y-3">
                    {/* Price Row */}
                    <div className="flex items-baseline gap-1.5">
                        <span className={`font-black text-base sm:text-lg ${product.discountPercent ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                            {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                            <span className="text-[10px] sm:text-xs text-slate-400 line-through font-medium">
                                {formatPrice(product.originalPrice)}
                            </span>
                        )}
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Compact Quantity Selector */}
                        <div className={`flex items-center bg-slate-100 dark:bg-slate-700/50 rounded-lg sm:rounded-xl p-0.5 transition-all h-8 sm:h-10 shrink-0 ${isOutOfStock ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <button
                                onClick={handleDecrement}
                                disabled={isOutOfStock}
                                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-md sm:rounded-lg bg-white dark:bg-slate-600 shadow-sm text-slate-500 dark:text-slate-200 hover:text-primary active:scale-90 transition-all cursor-pointer disabled:cursor-not-allowed"
                                aria-label="Decrease quantity"
                            >
                                <span className="material-icons-round text-xs sm:text-sm">remove</span>
                            </button>
                            <span className="w-5 sm:w-8 text-center text-xs sm:text-sm font-black text-slate-900 dark:text-white tabular-nums">{quantity}</span>
                            <button
                                onClick={handleIncrement}
                                disabled={isOutOfStock || quantity >= MAX_QUANTITY || (product.stockQuantity !== undefined && quantity >= product.stockQuantity)}
                                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-md sm:rounded-lg bg-white dark:bg-slate-600 shadow-sm text-slate-500 dark:text-slate-200 hover:text-primary active:scale-90 transition-all cursor-pointer disabled:cursor-not-allowed"
                                aria-label="Increase quantity"
                            >
                                <span className="material-icons-round text-xs sm:text-sm">add</span>
                            </button>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={`flex-1 h-8 sm:h-10 font-bold text-xs sm:text-sm rounded-lg sm:rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer
                                ${isOutOfStock
                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-none cursor-not-allowed'
                                    : 'bg-primary text-white shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'}`}
                        >
                            <span className="material-icons-round text-sm sm:text-lg">
                                {isOutOfStock ? 'block' : 'add_shopping_cart'}
                            </span>
                            <span className="hidden xs:inline sm:inline">Add</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
