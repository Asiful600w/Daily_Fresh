'use client';

import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/lib/api';
import React from 'react';

interface ProductListingProps {
    title: string;
    subtitle?: string;
    products: Product[];
    totalProducts: number;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    currentSort: string;
    onSortChange: (sort: string) => void;
    isUpdating: boolean;
}

export function ProductListing({
    title,
    subtitle,
    products,
    totalProducts,
    currentPage,
    totalPages,
    onPageChange,
    currentSort,
    onSortChange,
    isUpdating
}: ProductListingProps) {

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSortChange(e.target.value);
    };

    return (
        <div className={`transition-opacity duration-300 ${isUpdating ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">{title}</h1>
                    {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 hidden sm:block">Sort by:</span>
                    <select
                        value={currentSort}
                        onChange={handleSortChange}
                        disabled={isUpdating}
                        className="bg-white dark:bg-slate-800 border-none rounded-xl py-2 pl-4 pr-10 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer disabled:opacity-50"
                    >
                        <option value="newest">Newest</option>
                        <option value="best-selling">Best Selling</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="relative min-h-[400px]">
                {/* Loading State Overlay */}
                {isUpdating && (
                    <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-xl transition-all duration-300 animate-fade-in">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-bold text-primary animate-pulse">Updating...</span>
                        </div>
                    </div>
                )}

                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12 transition-opacity duration-300 ${isUpdating ? 'opacity-40' : 'opacity-100'}`}>
                    {products.map((product) => (
                        <ProductCard key={product.id} product={{ ...product, id: product.id }} />
                    ))}
                </div>

                {products.length === 0 && !isUpdating && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="material-icons-round text-6xl text-slate-200 dark:text-slate-700 mb-4">search_off</span>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No products found</h3>
                        <p className="text-slate-500">Try changing your filters.</p>
                    </div>
                )}
            </div>

            {/* Pagination - Dynamic */}
            {(totalPages > 0) && (
                <div className="flex justify-center flex-wrap gap-2">
                    <button
                        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="material-icons-round">chevron_left</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange?.(page)}
                            className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${currentPage === page
                                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="material-icons-round">chevron_right</span>
                    </button>
                </div>
            )}
        </section>
    );
}
