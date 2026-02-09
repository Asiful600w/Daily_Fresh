'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addToWishlistAction(productId: number) {
    try {
        console.log('Server Action: Adding to wishlist...', productId);
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error('Server Action: No user found');
            return { success: false, error: 'User not authenticated' };
        }

        console.log('Server Action: User found:', user.id);

        const { error, data } = await supabase
            .from('wishlists')
            .insert({ user_id: user.id, product_id: productId })
            .select();

        if (error) {
            console.error('Server Action: DB Error:', error);
            return { success: false, error: error.message };
        }

        console.log('Server Action: Success!', data);
        revalidatePath('/profile/wishlist');
        return { success: true };
    } catch (error: any) {
        console.error('Server Action: Exception:', error);
        return { success: false, error: error.message };
    }
}

export async function getWishlistIdsAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'User not authenticated', data: [] };
        }

        const { data, error } = await supabase
            .from('wishlists')
            .select('product_id')
            .eq('user_id', user.id);

        if (error) {
            console.error('Server Action getWishlistIds Error:', error);
            return { success: false, error: error.message, data: [] };
        }

        const ids = data.map((item: any) => item.product_id);
        return { success: true, data: ids };
    } catch (error: any) {
        console.error('Server Action getWishlistIds Exception:', error);
        return { success: false, error: error.message, data: [] };
    }
}

export async function removeFromWishlistAction(productId: number) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);

        if (error) {
            console.error('Server Action removeFromWishlist Error:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/profile/wishlist');
        return { success: true };
    } catch (error: any) {
        console.error('Server Action removeFromWishlist Exception:', error);
        return { success: false, error: error.message };
    }
}
