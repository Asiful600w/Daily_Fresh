'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/lib/api';

interface ProductGridProps {
    products: Product[];
    title?: string;
    subtitle?: string;
}

export function ProductGrid({ products, title = "Best selling 🔥", subtitle = "Based on this week's most popular purchases" }: ProductGridProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
                        {title}
                    </h2>
                    {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-600 dark:text-slate-400"
                    >
                        <span className="material-icons-round">chevron_left</span>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-600 dark:text-slate-400"
                    >
                        <span className="material-icons-round">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Slider Container */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar snap-x"
            >
                {products.map((product) => (
                    <div key={product.id} className="min-w-[200px] w-[200px] md:min-w-[240px] md:w-[240px] snap-start">
                        <ProductCard product={{ ...product, id: product.id }} />
                    </div>
                ))}
            </div>
        </section>
    );
}
