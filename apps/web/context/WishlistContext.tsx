'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
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
    const supabase = createClient();
    const [wishlistIds, setWishlistIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlistIds = React.useCallback(async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const { getWishlistIdsAction } = await import('@/actions/wishlist');
            const result = await getWishlistIdsAction();

            if (result.success) {
                setWishlistIds(result.data);
            } else {
                console.error('Error fetching wishlist:', result.error);
            }
        } catch (error: any) {
            console.error('Exception fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) {
            fetchWishlistIds();
        } else {
            setWishlistIds([]);
        }
    }, [user?.id, fetchWishlistIds]);

    const addToWishlist = async (productId: number) => {
        if (!user) return;

        // Optimistic Update
        setWishlistIds(prev => [...prev, productId]);

        try {
            const { addToWishlistAction } = await import('@/actions/wishlist');
            const result = await addToWishlistAction(productId);
            if (!result.success) {
                console.error('Failed to add to wishlist:', result.error);
                setWishlistIds(prev => prev.filter(id => id !== productId));
                alert(`Failed to add: ${result.error}`);
            }
        } catch (e) {
            console.error('Exception adding to wishlist:', e);
            setWishlistIds(prev => prev.filter(id => id !== productId));
        }
    };

    const removeFromWishlist = async (productId: number) => {
        if (!user) return;

        // Optimistic Update
        setWishlistIds(prev => prev.filter(id => id !== productId));

        try {
            const { removeFromWishlistAction } = await import('@/actions/wishlist');
            const result = await removeFromWishlistAction(productId);
            if (!result.success) {
                console.error('Failed to remove from wishlist:', result.error);
                setWishlistIds(prev => [...prev, productId]);
                alert(`Failed to remove: ${result.error}`);
            }
        } catch (e) {
            console.error('Exception removing from wishlist:', e);
            setWishlistIds(prev => [...prev, productId]);
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
