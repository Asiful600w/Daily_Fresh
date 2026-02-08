'use server'

import { createClient } from '@/lib/supabase/server';

export interface Review {
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
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}

/**
 * Check if a user is eligible to review a product
 * User must have purchased and received the product
 */
export async function checkReviewEligibility(
    userId: string,
    productId: number | string
): Promise<boolean> {
    try {
        const supabase = await createClient();

        // Use the database function
        const { data, error } = await supabase
            .rpc('check_user_can_review', {
                p_user_id: userId,
                p_product_id: Number(productId)
            });

        if (error) {
            console.error('Error checking review eligibility:', error);
            return false;
        }

        return data === true;
    } catch (error) {
        console.error('Exception checking review eligibility:', error);
        return false;
    }
}

/**
 * Submit a new review
 */
export async function submitReview(
    userId: string,
    productId: number | string,
    rating: number,
    comment: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        // Verify eligibility first
        const canReview = await checkReviewEligibility(userId, productId);
        if (!canReview) {
            return {
                success: false,
                error: 'You must purchase and receive this product before reviewing it.'
            };
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return { success: false, error: 'Rating must be between 1 and 5.' };
        }

        // Validate comment
        if (!comment || comment.trim().length < 10) {
            return { success: false, error: 'Review must be at least 10 characters.' };
        }

        // Insert review
        const { error } = await supabase
            .from('reviews')
            .insert({
                user_id: userId,
                product_id: Number(productId),
                rating,
                comment: comment.trim()
            });

        if (error) {
            console.error('Error submitting review:', error);

            // Check for duplicate review error
            if (error.code === '23505') {
                return { success: false, error: 'You have already reviewed this product.' };
            }

            return { success: false, error: 'Failed to submit review. Please try again.' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Exception submitting review:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}

/**
 * Get all visible reviews for a product
 */
export async function getProductReviews(productId: number | string): Promise<Review[]> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                User:user_id (
                    name
                )
            `)
            .eq('product_id', Number(productId))
            .eq('is_hidden', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Exception fetching reviews:', error);
        return [];
    }
}

/**
 * Get review statistics for a product
 */
export async function getProductReviewStats(productId: number | string): Promise<ReviewStats> {
    try {
        const supabase = await createClient();

        // Get all visible reviews
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('product_id', Number(productId))
            .eq('is_hidden', false);

        if (error || !reviews) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            };
        }

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => {
            ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
        });

        return {
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
            ratingDistribution
        };
    } catch (error) {
        console.error('Exception fetching review stats:', error);
        return {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
    }
}

/**
 * Get all reviews by a user
 */
export async function getUserReviews(userId: string): Promise<Review[]> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user reviews:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Exception fetching user reviews:', error);
        return [];
    }
}
