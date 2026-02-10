'use client';
import React, { useState } from 'react';
import { Category } from '@/lib/api';
import { CURRENCY_SYMBOL } from '@/lib/format';

interface SidebarShopFiltersProps {
    categories: Category[];
    selectedCategory?: string; // slug
    selectedSubcategory?: string; // name
    onCategoryChange: (categorySlug: string | undefined, subcategoryName?: string) => void;
    minPrice: number;
    maxPrice: number;
    currentMin: number;
    currentMax: number;
    onPriceChange: (min: number, max: number) => void;
}

export function SidebarShopFilters({
    categories,
    selectedCategory,
    selectedSubcategory,
    onCategoryChange,
    minPrice,
    maxPrice,
    currentMin,
    currentMax,
    onPriceChange
}: SidebarShopFiltersProps) {
    // Track which category drawer is expanded (separate from actual filter)
    const [expandedCategory, setExpandedCategory] = useState<string | null>(selectedCategory || null);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.min(Number(e.target.value), currentMax - 1);
        onPriceChange(val, currentMax);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.max(Number(e.target.value), currentMin + 1);
        onPriceChange(currentMin, val);
    };

    const minPercent = ((currentMin - minPrice) / (maxPrice - minPrice)) * 100;
    const maxPercent = ((currentMax - minPrice) / (maxPrice - minPrice)) * 100;

    const handleCategoryClick = (categorySlug: string) => {
        // Toggle the drawer open/close — don't filter products yet
        if (expandedCategory === categorySlug) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(categorySlug);
        }
    };

    const handleSubcategoryClick = (categorySlug: string, subcategoryName?: string) => {
        // NOW actually filter products
        onCategoryChange(categorySlug, subcategoryName);
    };

    return (
        <aside className="w-full space-y-8">
            {/* Categories */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-icons-round text-primary">category</span>
                    Categories
                </h3>
                <div className="space-y-1">
                    <div
                        className={`cursor-pointer px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${!selectedCategory ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        onClick={() => {
                            setExpandedCategory(null);
                            onCategoryChange(undefined);
                        }}
                    >
                        <span className="flex items-center gap-2">
                            <span className="material-icons-round text-sm">grid_view</span>
                            All Products
                        </span>
                    </div>

                    {categories.map(category => {
                        const isExpanded = expandedCategory === category.slug;
                        const isActive = selectedCategory === category.slug;

                        return (
                            <div key={category.id}>
                                {/* Category Header - clicking only expands, doesn't filter */}
                                <div
                                    className={`flex items-center justify-between cursor-pointer px-3 py-2.5 rounded-lg transition-all text-sm font-medium
                                        ${isActive
                                            ? 'bg-primary/10 text-primary font-bold'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                    onClick={() => handleCategoryClick(category.slug)}
                                >
                                    <span>{category.name}</span>
                                    <span className={`material-icons-round text-sm transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </div>

                                {/* Subcategories Drawer */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="pl-3 pr-1 py-1 space-y-0.5">
                                        {/* "All [Category]" option */}
                                        <div
                                            className={`cursor-pointer px-3 py-2 rounded-md transition-all text-xs font-semibold flex items-center gap-2
                                                ${isActive && !selectedSubcategory
                                                    ? 'text-primary bg-primary/5'
                                                    : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSubcategoryClick(category.slug, undefined);
                                            }}
                                        >
                                            <span className="material-icons-round text-xs">apps</span>
                                            All {category.name}
                                        </div>

                                        {category.subcategories.map(sub => (
                                            <div
                                                key={sub.name}
                                                className={`cursor-pointer px-3 py-2 rounded-md transition-all text-xs font-semibold flex items-center gap-2
                                                    ${selectedSubcategory === sub.name
                                                        ? 'text-primary bg-primary/5'
                                                        : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSubcategoryClick(category.slug, sub.name);
                                                }}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 shrink-0"></span>
                                                {sub.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-icons-round text-primary">price_change</span>
                    Price Range
                </h3>

                <div className="px-2 relative h-10 mb-6">
                    <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full -translate-y-1/2 z-0"></div>
                    <div
                        className="absolute top-1/2 h-1.5 bg-primary rounded-full -translate-y-1/2 z-10"
                        style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                    ></div>
                    <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={currentMin}
                        onChange={handleMinChange}
                        className="absolute w-full top-1/2 -translate-y-1/2 h-1.5 appearance-none bg-transparent pointer-events-none z-20 slider-thumb-pointer"
                        style={{ zIndex: currentMin > maxPrice - 100 ? 50 : 20 }}
                    />
                    <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={currentMax}
                        onChange={handleMaxChange}
                        className="absolute w-full top-1/2 -translate-y-1/2 h-1.5 appearance-none bg-transparent pointer-events-none z-30 slider-thumb-pointer"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
                        {CURRENCY_SYMBOL}{currentMin}
                    </div>
                    <span className="text-slate-400">-</span>
                    <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
                        {CURRENCY_SYMBOL}{currentMax}
                    </div>
                </div>
            </div>

            <style jsx>{`
                input[type=range]::-webkit-slider-thumb {
                    pointer-events: auto;
                    -webkit-appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #ffffff;
                    border: 2px solid #22c55e;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    margin-top: -8px;
                }
                input[type=range]::-moz-range-thumb {
                    pointer-events: auto;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #ffffff;
                    border: 2px solid #22c55e;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    border: none;
                }
            `}</style>
        </aside>
    );
}
