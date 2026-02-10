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
        setQuantity(prev => prev + 1);
    }, []);

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
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group relative h-full flex flex-col">
            {/* Image & Badges Container */}
            <div className="relative h-44 w-full mb-4 group-hover:scale-105 transition-transform duration-500 bg-gray-50/50 dark:bg-slate-700/30 rounded-2xl flex items-center justify-center overflow-hidden">
                <Link href={`/product/${product.id}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`} />

                {product.images && product.images.length > 0 && product.images[0] ? (
                    <Image
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain relative z-0 pointer-events-none p-4"
                        src={product.images[0]}
                    />
                ) : (
                    <span className="material-symbols-outlined text-4xl text-gray-300 relative z-0">image</span>
                )}

                {/* Badges Layout */}
                <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10 pointer-events-none">
                    {product.discountPercent && product.discountPercent > 0 && (
                        <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">
                            {product.discountPercent}% OFF
                        </div>
                    )}
                    {product.specialCategoryLabel && (
                        <div className="bg-yellow-400 text-slate-900 text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">
                            {product.specialCategoryLabel}
                        </div>
                    )}
                </div>

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-4">
                        <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-xl uppercase tracking-widest transform -rotate-12 border-2 border-white/20">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="space-y-2 flex-1 flex flex-col relative px-1">
                <Link href={`/product/${product.id}`} className="absolute inset-0 z-0" />

                <div className="relative z-10 pointer-events-none flex justify-between items-start gap-2">
                    <div className="flex-1">
                        {product.category && (
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.1em] mb-0.5">{product.category}</p>
                        )}
                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                    </div>

                    {/* Relocated Wishlist Button: Persistent on mobile, sliding hover animation on desktop */}
                    <div className="transition-all duration-300 transform md:translate-x-2 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100 pointer-events-auto shrink-0">
                        {variant === 'wishlist' ? (
                            <button
                                onClick={handleDeleteClick}
                                className="p-1 rounded-lg transition-all text-red-500 hover:text-red-600 cursor-pointer"
                                title="Remove from wishlist"
                            >
                                <span className="material-icons-round text-lg">delete_outline</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleWishlistClick}
                                className={`p-1 transition-all cursor-pointer ${isWishlisted ? 'text-red-500 scale-110' : 'text-slate-300 dark:text-slate-600 hover:text-red-500'}`}
                            >
                                <span className={`material-icons-round text-lg ${isWishlisted ? '' : 'material-icons-outlined'}`}>
                                    {isWishlisted ? 'favorite' : 'favorite_border'}
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="relative z-10 pointer-events-none">
                    {product.quantity && <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{product.quantity}</p>}
                </div>

                <div className="mt-auto pt-3 space-y-4 relative z-20">
                    {/* Price Row */}
                    <div className="flex items-baseline gap-2 min-h-[28px]">
                        <span className={`font-black text-xl ${product.discountPercent ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                            {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                            <span className="text-xs text-slate-400 line-through decoration-slate-400/50 font-medium">
                                {formatPrice(product.originalPrice)}
                            </span>
                        )}
                    </div>

                    {/* Action Row: Consistently combined for Premium feel */}
                    <div className="flex items-center gap-2">
                        {/* Compact Quantity Selector */}
                        <div className={`flex items-center bg-slate-100 dark:bg-slate-700/50 rounded-xl p-0.5 transition-all h-10 shrink-0 ${isOutOfStock ? 'opacity-50 pointer-events-none shadow-none' : 'hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm'}`}>
                            <button
                                onClick={handleDecrement}
                                disabled={isOutOfStock}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-600 shadow-sm text-slate-500 dark:text-slate-200 hover:text-primary active:scale-90 transition-all cursor-pointer disabled:cursor-not-allowed"
                                aria-label="Decrease quantity"
                            >
                                <span className="material-icons-round text-sm">remove</span>
                            </button>
                            <span className="w-8 text-center text-sm font-black text-slate-900 dark:text-white tabular-nums">{quantity}</span>
                            <button
                                onClick={handleIncrement}
                                disabled={isOutOfStock || (product.stockQuantity !== undefined && quantity >= product.stockQuantity)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-600 shadow-sm text-slate-500 dark:text-slate-200 hover:text-primary active:scale-90 transition-all cursor-pointer disabled:cursor-not-allowed"
                                aria-label="Increase quantity"
                            >
                                <span className="material-icons-round text-sm">add</span>
                            </button>
                        </div>

                        {/* Flex Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={`flex-1 h-10 font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer
                                ${isOutOfStock
                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-none cursor-not-allowed'
                                    : 'bg-primary text-white shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'}`}
                        >
                            <span className="material-icons-round text-lg">
                                {isOutOfStock ? 'block' : 'add_shopping_cart'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
