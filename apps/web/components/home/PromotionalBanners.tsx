'use client';

import { useRef } from 'react';
import Link from 'next/link';

interface Offer {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
}

interface PromotionalBannersProps {
    offers: Offer[];
}

export function PromotionalBanners({ offers }: PromotionalBannersProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Filter only offers with images to be safe
    const activeOffers = offers.filter(o => o.image_url);

    if (activeOffers.length === 0) return null;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400; // Card width approx
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section id="special-offers" className="relative group scroll-mt-24">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
                        Special Offers <span className="text-3xl">🏷️</span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Grab them before they're gone</p>
                </div>
                {activeOffers.length > 2 && (
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
                )}
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar scroll-smooth snap-x snap-mandatory"
            >
                {activeOffers.map((offer) => (
                    <div
                        key={offer.id}
                        className="relative min-w-[300px] md:min-w-[500px] h-[250px] rounded-3xl overflow-hidden group/card snap-center flex-shrink-0"
                    >
                        {/* Image */}
                        <img
                            alt={offer.name}
                            src={offer.image_url}
                            className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-center p-8 md:p-12 space-y-4">
                            <span className="text-white/80 text-sm font-bold uppercase tracking-wider bg-primary/20 backdrop-blur w-fit px-3 py-1 rounded-full border border-primary/30">
                                Limited Time
                            </span>
                            <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                                {offer.name}
                            </h3>
                            {offer.description && (
                                <p className="text-slate-200 text-sm md:text-base max-w-[80%] line-clamp-2">
                                    {offer.description}
                                </p>
                            )}
                            <Link
                                href={`/offers/${encodeURIComponent(offer.name)}`} // Assuming name is unique/slug-like or we add slug later
                                className="w-fit px-6 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-sm hover:bg-primary hover:text-white transition-all transform group-hover/card:translate-x-2"
                            >
                                Claim Offer
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
