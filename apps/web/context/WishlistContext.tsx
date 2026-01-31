'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface WishlistContextType {
    wishlistIds: number[];
    addToWishlist: (productId: number) => Promise<void>;
    removeFromWishlist: (productId: number) => Promise<void>;
    isInWishlist: (productId: number) => boolean;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [wishlistIds, setWishlistIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchWishlistIds();
        } else {
            setWishlistIds([]);
        }
    }, [user]);

    const fetchWishlistIds = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('wishlists')
                .select('product_id')
                .eq('user_id', user?.id);

            if (error) throw error;
            setWishlistIds(data.map((item: any) => item.product_id));
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (productId: number) => {
        if (!user) return;
        try {
            // Optimistic update
            setWishlistIds(prev => [...prev, productId]);

            const { error } = await supabase
                .from('wishlists')
                .insert({ user_id: user.id, product_id: productId });

            if (error) {
                // Revert on error
                setWishlistIds(prev => prev.filter(id => id !== productId));
                throw error;
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            alert('Failed to add to wishlist');
        }
    };

    const removeFromWishlist = async (productId: number) => {
        if (!user) return;
        try {
            // Optimistic update
            setWishlistIds(prev => prev.filter(id => id !== productId));

            const { error } = await supabase
                .from('wishlists')
                .delete()
                .eq('user_id', user.id)
                .eq('product_id', productId);

            if (error) {
                // Revert
                setWishlistIds(prev => [...prev, productId]);
                throw error;
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const isInWishlist = (productId: number) => wishlistIds.includes(productId);

    return (
        <WishlistContext.Provider value={{ wishlistIds, addToWishlist, removeFromWishlist, isInWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
