'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { checkReviewEligibility } from '@/lib/api';
import Link from 'next/link';

interface Review {
    id: number;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
}

export function Reviews({ productId }: { productId: number | string }) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [canReview, setCanReview] = useState(false);
    const [checkingEligibility, setCheckingEligibility] = useState(false);

    useEffect(() => {
        fetchReviews();
        if (user) {
            checkEligibility();
        }
    }, [productId, user]);

    const checkEligibility = async () => {
        if (!user) return;
        setCheckingEligibility(true);
        try {
            const allowed = await checkReviewEligibility(user.id, productId);
            setCanReview(allowed);
        } catch (error) {
            console.error('Error checking review eligibility:', error);
        } finally {
            setCheckingEligibility(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    profiles (
                        full_name,
                        avatar_url
                    )
                `)
                .eq('product_id', productId)
                .eq('is_hidden', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('reviews')
                .insert({
                    user_id: user.id,
                    product_id: productId,
                    rating,
                    comment
                });

            if (error) throw error;

            setComment('');
            setRating(5);
            fetchReviews(); // Refresh list
            checkEligibility(); // Re-check (should disable form)
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="py-12 border-t border-slate-100 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">Customer Reviews</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="flex gap-4 animate-pulse">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                            </div>
                        </div>
                    ) : reviews.length === 0 ? (
                        <p className="text-slate-500 italic">No reviews yet. Be the first to review!</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                                    {review.profiles?.avatar_url ? (
                                        <img src={review.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-icons-round text-slate-400">person</span>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white">{review.profiles?.full_name || 'Anonymous'}</h4>
                                        <span className="text-xs text-slate-400">• {new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`material-icons-round text-sm ${i < review.rating ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-700'}`}>star</span>
                                        ))}
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Write Review Form */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 h-fit border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Write a Review</h3>
                    {checkingEligibility ? (
                        <div className="flex gap-2 items-center text-slate-500 text-sm">
                            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                            Checking eligibility...
                        </div>
                    ) : user ? (
                        canReview ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Rating</label>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${rating >= star ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-300 hover:text-yellow-400'}`}
                                            >
                                                <span className="material-icons-round">star</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Review</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full rounded-xl bg-white dark:bg-slate-800 border-none p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400"
                                        rows={4}
                                        placeholder="Share your thoughts..."
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all disabled:opacity-70"
                                >
                                    {submitting ? 'Submitting...' : 'Post Review'}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                <span className="material-icons-round text-3xl text-slate-300 mb-2">lock</span>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 font-bold">Verified Purchase Only</p>
                                <p className="text-xs text-slate-400 px-4">You can write a review after you have purchased and received this product.</p>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-slate-500 mb-4">Please log in to write a review.</p>
                            <Link href="/login" className="inline-block px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold">
                                Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
