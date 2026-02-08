'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ProductCard } from '@/components/product/ProductCard';

export default function WishlistPage() {
    const { user, loading: authLoading } = useAuth();
    const [supabase] = useState(() => createClient());
    const { wishlistIds } = useWishlist();
    const [wishlistItems, setWishlistItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                setLoading(true);

                // Step 1: Fetch Wishlist IDs
                const { data: fullWishlistData, error: fullError } = await supabase
                    .from('wishlists')
                    .select('id, product_id, created_at')
                    .eq('user_id', user?.id)
                    .order('created_at', { ascending: false });

                if (fullError) throw fullError;

                if (fullWishlistData.length === 0) {
                    setWishlistItems([]);
                    setLoading(false);
                    return;
                }

                const ids = fullWishlistData.map((w: any) => w.product_id);

                // Step 2: Fetch Products details
                const { data: productsDetails, error: pError } = await supabase
                    .from('products')
                    .select('*')
                    .in('id', ids);

                if (pError) throw pError;

                const items = fullWishlistData.map((w: any) => {
                    const product = productsDetails?.find((p: any) => p.id === w.product_id);
                    return {
                        id: w.id, // Wishlist Record ID
                        product: product ? { ...product, image: product.image_url } : null
                    };
                }).filter((item: any) => item.product);

                setWishlistItems(items);
            } catch (error) {
                console.error('Error loading wishlist!', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchWishlist();
        }
    }, [user, supabase]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0d1b17] p-4 text-center">
                <div className="bg-white dark:bg-[#10221c] p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 dark:border-[#1e3a31]">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-icons-round text-4xl text-primary">lock_person</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Login Required</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        Please login to access your wishlist and save your favorite items for later.
                    </p>
                    <Link href="/login" replace className="block w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        Login / Signup
                    </Link>
                    <div className="mt-4">
                        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                            Back to Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Filter items based on the context's wishlistIds (which are updated optimistically)
    // This allows immediate removal from UI without waiting for re-fetch
    const displayedItems = wishlistItems.filter(item => wishlistIds.includes(item.product.id));

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
