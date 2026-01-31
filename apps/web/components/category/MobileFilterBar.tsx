'use client';
import React from 'react';

interface MobileFilterBarProps {
    totalResults: number;
    onFilterClick: () => void;
    currentSort: string;
    onSortChange: (sort: string) => void;
}

export function MobileFilterBar({ totalResults, onFilterClick, currentSort, onSortChange }: MobileFilterBarProps) {
    return (
        <div className="lg:hidden sticky top-[60px] z-30 bg-gray-50 dark:bg-[#0F172A] py-3 -mx-4 px-4 flex items-center justify-between border-b border-transparent">
            {/* Sort Dropdown (Simplified) */}
            <div className="relative">
                <select
                    value={currentSort}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="appearance-none bg-white dark:bg-slate-800 pl-3 pr-8 py-2 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="best-selling">Best Selling</option>
                </select>
                <span className="material-icons-round absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">
                    expand_more
                </span>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400">{totalResults} Results</span>
                <button
                    onClick={onFilterClick}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-transform"
                >
                    <span className="material-icons-round text-base">tune</span>
                    Filter
                </button>
            </div>
        </div>
    );
}
