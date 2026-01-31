'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { CURRENCY_SYMBOL } from '@/lib/format';

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

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.min(Number(e.target.value), currentMax - 1);
        onPriceChange(val, currentMax);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.max(Number(e.target.value), currentMin + 1);
        onPriceChange(currentMin, val);
    };

    // Calculate percentage for slider track positions
    const minPercent = ((currentMin - minPrice) / (maxPrice - minPrice)) * 100;
    const maxPercent = ((currentMax - minPrice) / (maxPrice - minPrice)) * 100;

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
                    <span className="text-primary font-bold text-sm">
                        {CURRENCY_SYMBOL}{currentMin} - {CURRENCY_SYMBOL}{currentMax}
                    </span>
                </div>
                <div className="px-2 relative h-10">
                    {/* Track Background */}
                    <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full -translate-y-1/2 z-0"></div>

                    {/* Active Range Track */}
                    <div
                        className="absolute top-1/2 h-1.5 bg-primary rounded-full -translate-y-1/2 z-10"
                        style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                    ></div>

                    {/* Range Inputs */}
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
                        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                        margin-top: -8px; /* Offset for vertical alignment/centering if needed, usually browser handles it */
                    }
                    /* Firefox thumb */
                    input[type=range]::-moz-range-thumb {
                        pointer-events: auto;
                        height: 20px;
                        width: 20px;
                        border-radius: 50%;
                        background: #ffffff;
                        border: 2px solid #22c55e;
                        cursor: pointer;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                        border: none;
                    } 
                `}</style>
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
