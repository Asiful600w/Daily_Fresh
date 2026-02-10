'use client';

import React from 'react';
import Link from 'next/link';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ProductCard } from '@/components/product/ProductCard';
import { useWishlist } from '@/context/WishlistContext';

interface WishlistClientProps {
    initialItems: any[];
}

export default function WishlistClient({ initialItems }: WishlistClientProps) {
    const { wishlistIds } = useWishlist();

    // We can use the initial items from server, but also filter them based on client context
    // to reflect immediate changes (like removing an item).
    // However, for the main list, server data is the source of truth for "what are the details".
    // If a user removes an item, it should disappear.

    const displayedItems = initialItems.filter(item => wishlistIds.includes(item.product.id));

    return (
        <div className="flex justify-center bg-background-light dark:bg-background-dark min-h-screen">
            <div className="flex w-full max-w-[1280px]">
                <ProfileSidebar activeTab="wishlist" />

                <main className="flex flex-col flex-1 p-4 md:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-[#0d1b17] dark:text-white text-3xl font-black tracking-tight">My Wishlist</h1>
                        <p className="text-[#4c9a80] text-base font-normal mt-1">
                            Save items you love to buy them later.
                        </p>
                    </div>

                    {displayedItems.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 bg-white dark:bg-[#10221c] rounded-3xl border border-[#cfe7df] dark:border-[#1e3a31]">
                            <span className="material-icons-round text-6xl text-slate-300 dark:text-slate-600 mb-4">favorite_border</span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your wishlist is empty</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">Explore our products and find something you like!</p>
                            <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedItems.map((item) => (
                                <ProductCard key={item.id} product={item.product} variant="wishlist" />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
