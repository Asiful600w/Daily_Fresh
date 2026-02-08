'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getAllReviews,
    toggleReviewVisibility,
    deleteReview,
    getReviewStatistics,
    type AdminReview,
    type ReviewFilters
} from '@/actions/reviews';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalReviews: 0,
        hiddenReviews: 0,
        averageRating: 0,
        recentReviews: 0
    });
    const [filters, setFilters] = useState<ReviewFilters>({});
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [reviewsData, statsData] = await Promise.all([
                getAllReviews(filters),
                getReviewStatistics()
            ]);
            setReviews(reviewsData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggleVisibility = async (reviewId: number, currentlyHidden: boolean) => {
        const result = await toggleReviewVisibility(reviewId, !currentlyHidden);
        if (result.success) {
            loadData();
        } else {
            alert(result.error);
        }
    };

    const handleDelete = async (reviewId: number) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        const result = await deleteReview(reviewId);
        if (result.success) {
            loadData();
        } else {
            alert(result.error);
        }
    };

    const handleSearch = () => {
        setFilters({ ...filters, searchTerm });
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Reviews Management</h1>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Reviews</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalReviews}</p>
                        </div>
                        <span className="material-icons-round text-3xl text-blue-500">rate_review</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Average Rating</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.averageRating.toFixed(1)}</p>
                        </div>
                        <span className="material-icons-round text-3xl text-yellow-500">star</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Hidden Reviews</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.hiddenReviews}</p>
                        </div>
                        <span className="material-icons-round text-3xl text-red-500">visibility_off</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Last 7 Days</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.recentReviews}</p>
                        </div>
                        <span className="material-icons-round text-3xl text-green-500">trending_up</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Search</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Product, user, comment..."
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                            />
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Visibility</label>
                        <select
                            value={filters.isHidden === undefined ? 'all' : filters.isHidden ? 'hidden' : 'visible'}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFilters({
                                    ...filters,
                                    isHidden: value === 'all' ? undefined : value === 'hidden'
                                });
                            }}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                        >
                            <option value="all">All</option>
                            <option value="visible">Visible</option>
                            <option value="hidden">Hidden</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Rating</label>
                        <select
                            value={filters.rating || 'all'}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFilters({
                                    ...filters,
                                    rating: value === 'all' ? undefined : Number(value)
                                });
                            }}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                        >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">&nbsp;</label>
                        <button
                            onClick={() => {
                                setFilters({});
                                setSearchTerm('');
                            }}
                            className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No reviews found
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        {/* Product Info */}
                                        <div className="flex items-center gap-3 mb-3">
                                            {review.product?.images?.[0] && (
                                                <img
                                                    src={review.product.images[0]}
                                                    alt={review.product.name}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white">
                                                    {review.product?.name || 'Unknown Product'}
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    by {review.User?.name || review.User?.email || 'Anonymous'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={`material-icons-round text-sm ${i < review.rating
                                                        ? 'text-yellow-400'
                                                        : 'text-slate-200 dark:text-slate-700'
                                                        }`}
                                                >
                                                    star
                                                </span>
                                            ))}
                                            <span className="text-sm text-slate-500 ml-2">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* Comment */}
                                        <p className="text-slate-600 dark:text-slate-300 mb-2">
                                            {review.comment}
                                        </p>

                                        {/* Status Badge */}
                                        {review.is_hidden && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                                                <span className="material-icons-round text-xs">visibility_off</span>
                                                Hidden
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleToggleVisibility(review.id, review.is_hidden)}
                                            className={`p-2 rounded-lg transition-colors ${review.is_hidden
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200'
                                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200'
                                                }`}
                                            title={review.is_hidden ? 'Show review' : 'Hide review'}
                                        >
                                            <span className="material-icons-round text-lg">
                                                {review.is_hidden ? 'visibility' : 'visibility_off'}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors"
                                            title="Delete review"
                                        >
                                            <span className="material-icons-round text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
