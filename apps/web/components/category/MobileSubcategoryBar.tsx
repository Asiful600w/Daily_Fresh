'use client';
import React from 'react';
import Link from 'next/link';

interface Subcategory {
    name: string;
    count?: number;
}

interface MobileSubcategoryBarProps {
    subcategories: Subcategory[];
    currentCategorySlug: string;
    currentSubcategory?: string | null;
}

export function MobileSubcategoryBar({ subcategories, currentCategorySlug, currentSubcategory }: MobileSubcategoryBarProps) {
    return (
        <div className="lg:hidden w-full overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sticky top-[110px] z-30 bg-gray-50 dark:bg-[#0F172A] pt-1">
            <div className="flex items-center gap-2 w-max">
                <Link
                    href={`/category/${currentCategorySlug}`}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${!currentSubcategory
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                        }`}
                >
                    All
                </Link>
                {subcategories.map((sub) => {
                    const isActive = currentSubcategory === sub.name;
                    return (
                        <Link
                            key={sub.name}
                            href={`/category/${currentCategorySlug}?subcategory=${encodeURIComponent(sub.name)}`}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${isActive
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                }`}
                        >
                            {sub.name}
                            {/* Optional: Show count if space permits, but maybe too cluttered for chips */}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
