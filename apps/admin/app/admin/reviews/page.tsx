'use client';

import { useState, useEffect } from 'react';
import { getAdminReviews, toggleReviewVisibility, deleteReview } from '@/lib/api';
import { formatPrice } from '@/lib/format';

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
    const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');

    useEffect(() => {
        fetchData();
    }, [ratingFilter, visibilityFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getAdminReviews({
                rating: ratingFilter,
                visibility: visibilityFilter
            });
            setReviews(data);
        } catch (err: any) {
            console.error('Failed to fetch reviews', err);
            setError(err.message || 'Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleVisibility = async (id: number, currentStatus: boolean) => {
        try {
            await toggleReviewVisibility(id, !currentStatus);
            // Optimistic update or refresh
            setReviews(reviews.map(r => r.id === id ? { ...r, is_hidden: !currentStatus } : r));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
        try {
            await deleteReview(id);
            setReviews(reviews.filter(r => r.id !== id));
        } catch (error) {
            alert('Failed to delete review');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <span className="material-symbols-outlined text-4xl mb-2">error</span>
                <p className="font-bold">Error loading reviews</p>
                <p className="text-sm opacity-80">{error}</p>
                <button onClick={fetchData} className="mt-4 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-main">Reviews</h1>
                <p className="text-text-muted mt-2">Manage customer product reviews.</p>
            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-border-subtle shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-text-muted">filter_list</span>
                    <span className="font-bold text-sm text-text-main">Filters:</span>
                </div>

                <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>

                <select
                    value={visibilityFilter}
                    onChange={(e) => setVisibilityFilter(e.target.value as any)}
                    className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                    <option value="all">All Status</option>
                    <option value="visible">Visible</option>
                    <option value="hidden">Hidden</option>
                </select>

                {(ratingFilter !== 'all' || visibilityFilter !== 'all') && (
                    <button
                        onClick={() => { setRatingFilter('all'); setVisibilityFilter('all'); }}
                        className="ml-auto px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-border-subtle">
                            <tr>
                                <th className="px-6 py-4 font-bold text-sm text-text-muted uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 font-bold text-sm text-text-muted uppercase tracking-wider">Reviewer</th>
                                <th className="px-6 py-4 font-bold text-sm text-text-muted uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-4 font-bold text-sm text-text-muted uppercase tracking-wider">Comment</th>
                                <th className="px-6 py-4 font-bold text-sm text-text-muted uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 font-bold text-sm text-text-muted uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-bold text-sm text-text-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                                        No reviews found.
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
                                                    {review.products?.image_url ? (
                                                        <img src={review.products.image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full">
                                                            <span className="material-symbols-outlined text-slate-400">image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-text-main line-clamp-1 max-w-[150px]" title={review.products?.name}>
                                                    {review.products?.name || 'Unknown Product'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                                    {review.profiles?.avatar_url ? (
                                                        <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-xs text-primary">person</span>
                                                    )}
                                                </div>
                                                <span className="text-text-main text-sm">{review.profiles?.full_name || 'Anonymous'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex text-yellow-500 text-sm">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={`material-symbols-outlined !text-[16px] ${i < review.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`}>star</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-text-muted line-clamp-2 max-w-xs" title={review.comment}>
                                                {review.comment}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {review.is_hidden ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    Hidden
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Visible
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleVisibility(review.id, review.is_hidden)}
                                                    className={`p-2 rounded-lg transition-colors ${review.is_hidden
                                                        ? 'bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-400'
                                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                                                        }`}
                                                    title={review.is_hidden ? "Show Review" : "Hide Review"}
                                                >
                                                    <span className="material-symbols-outlined !text-lg">
                                                        {review.is_hidden ? 'visibility' : 'visibility_off'}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 transition-colors"
                                                    title="Delete Review"
                                                >
                                                    <span className="material-symbols-outlined !text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
