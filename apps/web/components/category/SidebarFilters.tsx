'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { PriceRangeSlider } from '../ui/PriceRangeSlider';

interface SidebarFiltersProps {
    subcategories: { name: string; count?: number }[];
    currentCategory: string; // The slug
    minPrice: number;
    maxPrice: number;
    currentMin: number;
    currentMax: number;
    onPriceChange: (min: number, max: number) => void;
}

export function SidebarFilters({
    subcategories,
    currentCategory,
    minPrice,
    maxPrice,
    currentMin,
    currentMax,
    onPriceChange
}: SidebarFiltersProps) {
    const searchParams = useSearchParams();
    const currentSub = searchParams.get('subcategory');

    return (
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-10">
            <section>
                <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Categories</h3>
                <div className="space-y-1">
                    {subcategories.map((sub) => {
                        const isActive = currentSub === sub.name;
                        return (
                            <Link
                                key={sub.name}
                                href={`/category/${currentCategory}?subcategory=${encodeURIComponent(sub.name)}`}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive
                                    ? 'bg-primary/10 text-primary font-bold'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium'
                                    }`}
                            >
                                <span className="flex items-center gap-3">
                                    <span className="material-icons-round text-xl">
                                        arrow_right
                                    </span>
                                    {sub.name}
                                </span>
                                <span className={`text-xs ${isActive ? 'bg-primary text-white' : 'text-slate-400 group-hover:text-slate-600'} px-2 py-0.5 rounded-full`}>
                                    {sub.count || 0}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <section>
                <div className="flex justify-between items-end mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Price Range</h3>
                </div>

                <PriceRangeSlider
                    min={minPrice}
                    max={maxPrice}
                    currentMin={currentMin}
                    currentMax={currentMax}
                    onChange={onPriceChange}
                />
            </section>

            <section className="space-y-4">
                <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Attributes</h3>
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-primary transition-colors">
                        <input defaultChecked className="hidden peer" type="checkbox" />
                        <div className="w-2.5 h-2.5 bg-primary rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Organic Only</span>
                </label>
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mt-8">
                    <h4 className="font-bold text-sm mb-2 text-slate-900 dark:text-white">Need help?</h4>
                    <p className="text-xs text-slate-500 mb-4">Our nutritionists are available 24/7 for consultation.</p>
                    <button className="w-full py-2 bg-white dark:bg-slate-800 text-primary text-xs font-bold rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-all">
                        Chat Now
                    </button>
                </div>
            </section>
        </aside>
    );
}
