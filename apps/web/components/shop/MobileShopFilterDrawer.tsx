'use client';
import React, { useState } from 'react';
import { Category } from '@/lib/api';
import { PriceRangeSlider } from '../ui/PriceRangeSlider';

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

    const handleCategoryClick = (categorySlug: string) => {
        if (expandedCategory === categorySlug) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(categorySlug);
        }
    };

    const handleSubcategoryClick = (categorySlug: string, subcategoryName?: string) => {
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

                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
                                        >
                                            <div className="pl-2 grid grid-cols-2 gap-1.5 py-1">
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
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Price Range</h4>
                        <PriceRangeSlider
                            min={minPrice}
                            max={maxPrice}
                            currentMin={currentMin}
                            currentMax={currentMax}
                            onChange={onPriceChange}
                        />
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
            </div>
        </div>
    );
}
