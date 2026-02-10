'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart, CartItem } from '@/context/CartContext';
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

    const handleWishlistClick = async (e: React.MouseEvent) => {
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
    };

    const handleDeleteClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        await removeFromWishlist(Number(product.id));
    };

    const handleIncrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setQuantity(prev => prev + 1);
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) return;
        setQuantity(prev => Math.max(1, prev - 1));
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation to product detail
        e.stopPropagation();

        if (isOutOfStock) return;

        addItem({
            id: String(product.id), // Ensure string ID for consistency
            name: product.name,
            price: product.price,
            images: product.images || [],
            quantity: quantity,
            category: product.category,
            pack: product.quantity,
            color: '' // Handle undefined color explicitly
        });

        const imageSrc = product.images && product.images.length > 0 ? product.images[0] : '/placeholder-food.png';
        triggerFly(e.currentTarget as HTMLElement, imageSrc, quantity);

        // Optional: Reset quantity after adding? Or keep it? keeping it for now.
        // setQuantity(1); 
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group relative h-full flex flex-col">
            {/* Image & Badges Container */}
            <div className="relative h-40 w-full mb-4 group-hover:scale-105 transition-transform duration-500 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                <Link href={`/product/${product.id}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`} />

                {product.images && product.images.length > 0 && product.images[0] ? (
                    <Image
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain relative z-0 pointer-events-none p-2"
                        src={product.images[0]}
                    />
                ) : (
                    <span className="material-symbols-outlined text-4xl text-gray-300 relative z-0">image</span>
                )}

                {/* Discount Badge */}
                {product.discountPercent && product.discountPercent > 0 && (
                    <div className="absolute top-0 left-0 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10 pointer-events-none">
                        {product.discountPercent}% OFF
                    </div>
                )}

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-4">
                        <span className="bg-red-500 text-white text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-full shadow-xl uppercase tracking-widest transform -rotate-12 border-2 border-white/20">
                            Out of Stock
                        </span>
                    </div>
                )}

                {/* Special Category Badge */}
                {product.specialCategoryLabel && (
                    <div className="absolute top-0 left-0 mt-6 bg-yellow-400/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10 pointer-events-none">
                        {product.specialCategoryLabel}
                    </div>
                )}

                {variant === 'wishlist' ? (
                    <button
                        onClick={handleDeleteClick}
                        className="absolute top-0 right-0 p-2 rounded-full transition-colors bg-red-50 text-red-500 hover:bg-red-100 z-20 cursor-pointer"
                        title="Remove from wishlist"
                    >
                        <span className="material-icons-round text-sm">delete_outline</span>
                    </button>
                ) : (
                    <button
                        onClick={handleWishlistClick}
                        className={`absolute top-0 right-0 p-2 rounded-full transition-colors z-20 cursor-pointer ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-red-500'}`}
                    >
                        <span className={`material-icons-round text-sm ${isWishlisted ? 'material-icons' : 'material-icons-outlined'}`}>
                            {isWishlisted ? 'favorite' : 'favorite_border'}
                        </span>
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="space-y-2 flex-1 flex flex-col relative">
                <Link href={`/product/${product.id}`} className="absolute inset-0 z-0" />

                <div className="relative z-10 pointer-events-none">
                    {product.category && (
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">{product.category}</p>
                    )}
                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                    {product.quantity && <p className="text-xs text-slate-500 dark:text-slate-400">{product.quantity}</p>}
                </div>

                <div className="mt-auto pt-2 space-y-3 relative z-20">
                    {/* Price Area */}
                    <div className="flex flex-wrap items-center justify-between gap-3 min-h-[44px]">
                        <div className="flex flex-col min-w-fit">
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className={`font-bold text-lg ${product.discountPercent ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                    {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && (
                                    <span className="text-xs text-slate-400 line-through decoration-slate-400/50">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className={`flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1 transition-opacity shrink-0 ${isOutOfStock ? 'opacity-50' : ''}`}>
                            <button
                                onClick={handleDecrement}
                                disabled={isOutOfStock}
                                className="w-6 h-6 flex items-center justify-center rounded-md bg-white dark:bg-slate-600 shadow-sm text-slate-600 dark:text-slate-200 hover:text-primary active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
                            >
                                <span className="material-icons-round text-xs">remove</span>
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white pointer-events-none">{quantity}</span>
                            <button
                                onClick={handleIncrement}
                                disabled={isOutOfStock || (product.stockQuantity !== undefined && quantity >= product.stockQuantity)}
                                className="w-6 h-6 flex items-center justify-center rounded-md bg-white dark:bg-slate-600 shadow-sm text-slate-600 dark:text-slate-200 hover:text-primary active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
                            >
                                <span className="material-icons-round text-xs">add</span>
                            </button>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`w-full py-2 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer
                            ${isOutOfStock
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 shadow-none cursor-not-allowed translate-y-0'
                                : 'bg-primary text-white shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none'}`}
                    >
                        <span className="material-icons-round text-sm">
                            {isOutOfStock ? 'block' : 'shopping_cart'}
                        </span>
                        <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
