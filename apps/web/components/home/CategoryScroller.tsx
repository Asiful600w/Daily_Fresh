'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/lib/api';

interface CategoryScrollerProps {
    categories: Category[];
}

export function CategoryScroller({ categories }: CategoryScrollerProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        isDragging.current = true;
        startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
        scrollLeft.current = scrollContainerRef.current.scrollLeft;
        scrollContainerRef.current.style.cursor = 'grabbing';
        scrollContainerRef.current.style.userSelect = 'none'; // Prevent text selection
        scrollContainerRef.current.style.scrollBehavior = 'auto'; // Disable smooth scroll during drag
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX.current) * 2; // Scroll speed
        scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const handleMouseUp = () => {
        if (!scrollContainerRef.current) return;
        isDragging.current = false;
        scrollContainerRef.current.style.cursor = 'pointer';
        scrollContainerRef.current.style.userSelect = '';
        scrollContainerRef.current.style.scrollBehavior = 'smooth'; // Restore smooth scroll
    };

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
                className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar scroll-smooth cursor-pointer active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        draggable={false} // Prevent default ghost image drag
                        className="flex-shrink-0 flex items-center gap-4 bg-white dark:bg-slate-800 p-3 pr-6 rounded-2xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-primary transition-all group/item min-w-[220px] select-none"
                    >
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center group-hover/item:bg-primary/10 transition-colors shrink-0 pointer-events-none relative overflow-hidden">
                            <Image
                                alt={cat.name}
                                fill
                                className="object-cover pointer-events-none group-hover/item:scale-110 transition-transform duration-300"
                                src={cat.img}
                            />
                        </div>
                        <div className="flex flex-col pointer-events-none">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{cat.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
