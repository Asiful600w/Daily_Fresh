'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Category } from '@/lib/api';

interface CategoryScrollerProps {
    categories: Category[];
}

export function CategoryScroller({ categories }: CategoryScrollerProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="group">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
                        Categories <span className="text-3xl">📦</span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Browse our wide range of freshness</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-600 dark:text-slate-400"
                        aria-label="Scroll left"
                    >
                        <span className="material-icons-round">chevron_left</span>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-600 dark:text-slate-400"
                        aria-label="Scroll right"
                    >
                        <span className="material-icons-round">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar scroll-smooth"
            >
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="flex-shrink-0 flex items-center gap-4 bg-white dark:bg-slate-800 p-3 pr-6 rounded-2xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-primary transition-all group/item min-w-[220px]"
                    >
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center group-hover/item:bg-primary/10 transition-colors shrink-0">
                            <img alt={cat.name} className="w-10 h-10 object-contain" src={cat.img} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{cat.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
