'use client';

import React from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
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
        setQuantity(prev => Math.max(1, prev - 1));
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation to product detail
        e.stopPropagation();

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
            <Link href={`/product/${product.id}`} className="flex flex-col h-full">
                {/* Image & Badges */}
                {/* Image & Badges */}
                <div className="relative h-40 w-full mb-4 group-hover:scale-105 transition-transform duration-500 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                    {product.images && product.images.length > 0 && product.images[0] ? (
                        <NextImage
                            alt={product.name}
                            className="object-contain"
                            src={product.images[0]}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <span className="material-symbols-outlined text-4xl text-gray-300">image</span>
                    )}

                    {/* Discount Badge */}
                    {product.discountPercent && product.discountPercent > 0 && (
                        <div className="absolute top-0 left-0 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10">
                            {product.discountPercent}% OFF
                        </div>
                    )}

                    {/* Special Category Badge */}
                    {product.specialCategoryLabel && (
                        <div className="absolute top-0 left-0 mt-6 bg-yellow-400/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10">
                            {product.specialCategoryLabel}
                        </div>
                    )}

                    {variant === 'wishlist' ? (
                        <button
                            onClick={handleDeleteClick}
                            className="absolute top-0 right-0 p-2 rounded-full transition-colors bg-red-50 text-red-500 hover:bg-red-100"
                            title="Remove from wishlist"
                        >
                            <span className="material-icons-round text-sm">delete_outline</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleWishlistClick}
                            className={`absolute top-0 right-0 p-2 rounded-full transition-colors ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-red-500'}`}
                        >
                            <span className={`material-icons-round text-sm ${isWishlisted ? 'material-icons' : 'material-icons-outlined'}`}>
                                {isWishlisted ? 'favorite' : 'favorite_border'}
                            </span>
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-2 flex-1 flex flex-col">
                    {product.category && (
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">{product.category}</p>
                    )}
                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                    {product.quantity && <p className="text-xs text-slate-500 dark:text-slate-400">{product.quantity}</p>}

                    <div className="mt-auto pt-2 space-y-3">
                        {/* Price Area */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-2">
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
                            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                                <button
                                    onClick={handleDecrement}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-white dark:bg-slate-600 shadow-sm text-slate-600 dark:text-slate-200 hover:text-primary active:scale-95 transition-all"
                                >
                                    <span className="material-icons-round text-xs">remove</span>
                                </button>
                                <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">{quantity}</span>
                                <button
                                    onClick={handleIncrement}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-white dark:bg-slate-600 shadow-sm text-slate-600 dark:text-slate-200 hover:text-primary active:scale-95 transition-all"
                                >
                                    <span className="material-icons-round text-xs">add</span>
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            className="w-full py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-icons-round text-sm">shopping_cart</span>
                            <span>Add to Cart</span>
                        </button>
                    </div>
                </div>
            </Link>
        </div>
    );
}
