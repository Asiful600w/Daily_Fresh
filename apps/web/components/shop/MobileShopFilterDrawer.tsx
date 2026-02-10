'use client';
import React, { useState } from 'react';
import { Category } from '@/lib/api';
import { CURRENCY_SYMBOL } from '@/lib/format';

interface MobileShopFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    selectedCategory?: string;
    selectedSubcategory?: string;
    onCategoryChange: (categorySlug: string | undefined, subcategoryName?: string) => void;
    minPrice: number;
    maxPrice: number;
    currentMin: number;
    currentMax: number;
    onPriceChange: (min: number, max: number) => void;
}

export function MobileShopFilterDrawer({
    isOpen,
    onClose,
    categories,
    selectedCategory,
    selectedSubcategory,
    onCategoryChange,
    minPrice,
    maxPrice,
    currentMin,
    currentMax,
    onPriceChange
}: MobileShopFilterDrawerProps) {
    // Track which category is expanded in the drawer
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
        // Toggle expand/collapse — don't filter yet
        if (expandedCategory === categorySlug) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(categorySlug);
        }
    };

    const handleSubcategoryClick = (categorySlug: string, subcategoryName?: string) => {
        // Now filter and close drawer
        onCategoryChange(categorySlug, subcategoryName);
    };

    return (
        <div className={`fixed inset-0 z-[100] transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl transition-transform duration-300 flex flex-col max-h-[85vh] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>

                {/* Handle */}
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-4 mb-2 flex-shrink-0" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Filters</h3>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Categories */}
                    <section>
                        <h4 className="font-bold mb-4 text-slate-900 dark:text-white">Categories</h4>
                        <div className="space-y-2">
                            {/* All Products */}
                            <div
                                className={`cursor-pointer px-4 py-3 rounded-xl transition-colors text-sm font-bold border flex items-center gap-2 ${!selectedCategory ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-300'}`}
                                onClick={() => {
                                    setExpandedCategory(null);
                                    onCategoryChange(undefined);
                                }}
                            >
                                <span className="material-icons-round text-sm">grid_view</span>
                                All Products
                            </div>

                            {categories.map(category => {
                                const isExpanded = expandedCategory === category.slug;
                                const isActive = selectedCategory === category.slug;

                                return (
                                    <div key={category.id} className="space-y-1">
                                        {/* Category Header — toggles dropdown */}
                                        <div
                                            className={`flex items-center justify-between cursor-pointer px-4 py-3 rounded-xl transition-all text-sm font-bold border
                                                ${isActive
                                                    ? 'bg-primary/10 border-primary text-primary'
                                                    : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-300'
                                                }`}
                                            onClick={() => handleCategoryClick(category.slug)}
                                        >
                                            <span>{category.name}</span>
                                            <span className={`material-icons-round text-sm transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                                expand_more
                                            </span>
                                        </div>

                                        {/* Subcategories dropdown */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
                                        >
                                            <div className="pl-2 grid grid-cols-2 gap-1.5 py-1">
                                                {/* All [Category] */}
                                                <div
                                                    className={`cursor-pointer px-3 py-2.5 rounded-lg text-xs font-semibold text-center border transition-all
                                                        ${isActive && !selectedSubcategory
                                                            ? 'border-primary text-primary bg-primary/5'
                                                            : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/50 hover:text-primary'
                                                        }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSubcategoryClick(category.slug, undefined);
                                                    }}
                                                >
                                                    All
                                                </div>
                                                {category.subcategories.map(sub => (
                                                    <div
                                                        key={sub.name}
                                                        className={`cursor-pointer px-3 py-2.5 rounded-lg text-xs font-semibold text-center border transition-all
                                                            ${selectedSubcategory === sub.name
                                                                ? 'border-primary text-primary bg-primary/5'
                                                                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/50 hover:text-primary'
                                                            }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSubcategoryClick(category.slug, sub.name);
                                                        }}
                                                    >
                                                        {sub.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Price Range */}
                    <section>
                        <div className="flex justify-between items-end mb-6">
                            <h4 className="font-bold text-slate-900 dark:text-white">Price Range</h4>
                            <span className="text-primary font-bold text-base">
                                {CURRENCY_SYMBOL}{currentMin} - {CURRENCY_SYMBOL}{currentMax}
                            </span>
                        </div>
                        <div className="px-2 relative h-10">
                            <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full -translate-y-1/2 z-0"></div>
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
                        <div className="flex justify-between mt-1 text-xs font-semibold text-slate-400 uppercase tracking-tighter">
                            <span>{CURRENCY_SYMBOL}{minPrice}</span>
                            <span>{CURRENCY_SYMBOL}{maxPrice}</span>
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors"
                    >
                        Show Results
                    </button>
                </div>

                <style jsx>{`
                    input[type=range]::-webkit-slider-thumb {
                        pointer-events: auto;
                        -webkit-appearance: none;
                        height: 24px;
                        width: 24px;
                        border-radius: 50%;
                        background: #ffffff;
                        border: 2px solid #22c55e;
                        cursor: pointer;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        margin-top: -9px;
                    }
                    input[type=range]::-moz-range-thumb {
                        pointer-events: auto;
                        height: 24px;
                        width: 24px;
                        border-radius: 50%;
                        background: #ffffff;
                        border: 2px solid #22c55e;
                        cursor: pointer;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        border: none;
                    } 
                `}</style>
            </div>
        </div>
    );
}
