'use server'

import { getSupabaseService } from '@/lib/supabaseService';
import { revalidatePath } from 'next/cache';

export interface AdminReview {
    id: number;
    user_id: string;
    product_id: number;
    rating: number;
    comment: string;
    is_hidden: boolean;
    created_at: string;
    updated_at: string;
    User?: {
        name: string;
        email: string;
    };
    product?: {
        name: string;
        images: string[];
    };
}

export interface ReviewFilters {
    isHidden?: boolean;
    rating?: number;
    searchTerm?: string;
    productId?: number;
}

/**
 * Get all reviews with optional filters (Admin only)
 */
export async function getAllReviews(filters?: ReviewFilters): Promise<AdminReview[]> {
    try {
        const supabase = getSupabaseService();

        let query = supabase
            .from('reviews')
            .select(`
                *,
                User:user_id (
                    name,
                    email
                ),
                product:product_id (
                    name,
                    images
                )
            `)
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters?.isHidden !== undefined) {
            query = query.eq('is_hidden', filters.isHidden);
        }

        if (filters?.rating) {
            query = query.eq('rating', filters.rating);
        }

        if (filters?.productId) {
            query = query.eq('product_id', filters.productId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching all reviews:', error);
            return [];
        }

        // Apply search filter in memory (if needed)
        let results = data || [];
        if (filters?.searchTerm && results.length > 0) {
            const term = filters.searchTerm.toLowerCase();
            results = results.filter(review =>
                review.product?.name?.toLowerCase().includes(term) ||
                review.User?.name?.toLowerCase().includes(term) ||
                review.comment?.toLowerCase().includes(term)
            );
        }

        return results;
    } catch (error) {
        console.error('Exception fetching all reviews:', error);
        return [];
    }
}

/**
 * Toggle review visibility (hide/show)
 */
export async function toggleReviewVisibility(
    reviewId: number,
    isHidden: boolean
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = getSupabaseService();

        const { error } = await supabase
            .from('reviews')
            .update({ is_hidden: isHidden })
            .eq('id', reviewId);

        if (error) {
            console.error('Error toggling review visibility:', error);
            return { success: false, error: 'Failed to update review visibility.' };
        }

        revalidatePath('/admin/reviews');
        return { success: true };
    } catch (error: any) {
        console.error('Exception toggling review visibility:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}

/**
 * Delete a review (soft delete by hiding)
 */
export async function deleteReview(reviewId: number): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = getSupabaseService();

        // For now, just hide it. Could add a deleted_at column for true soft delete
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);

        if (error) {
            console.error('Error deleting review:', error);
            return { success: false, error: 'Failed to delete review.' };
        }

        revalidatePath('/admin/reviews');
        return { success: true };
    } catch (error: any) {
        console.error('Exception deleting review:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}

/**
 * Get review statistics for admin dashboard
 */
export async function getReviewStatistics(): Promise<{
    totalReviews: number;
    hiddenReviews: number;
    averageRating: number;
    recentReviews: number;
}> {
    try {
        const supabase = getSupabaseService();

        // Get all reviews
        const { data: allReviews } = await supabase
            .from('reviews')
            .select('rating, is_hidden, created_at');

        if (!allReviews) {
            return { totalReviews: 0, hiddenReviews: 0, averageRating: 0, recentReviews: 0 };
        }

        const totalReviews = allReviews.length;
        const hiddenReviews = allReviews.filter(r => r.is_hidden).length;
        const averageRating = totalReviews > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        // Reviews in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentReviews = allReviews.filter(
            r => new Date(r.created_at) > sevenDaysAgo
        ).length;

        return {
            totalReviews,
            hiddenReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            recentReviews
        };
    } catch (error) {
        console.error('Exception fetching review statistics:', error);
        return { totalReviews: 0, hiddenReviews: 0, averageRating: 0, recentReviews: 0 };
    }
}
