'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, searchProducts } from '@/lib/api';
import { formatPrice } from '@/lib/format';

interface MobileSearchDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileSearchDrawer({ isOpen, onClose }: MobileSearchDrawerProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        } else {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 1) {
                setIsSearching(true);
                try {
                    const data = await searchProducts(query);
                    setResults(data);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (productId: number | string) => {
        router.push(`/product/${productId}`);
        onClose();
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            // Navigate to a search page if you have one, or just close and let user browse results if browsing is supported in drawer.
            // For now, let's assume we just show results in the drawer or navigate to first result(?)
            // Better: If we had a dedicated /search page, we'd go there. 
            // Since we don't seem to have a dedicated /search page (just dropdown), let's just keep the drawer open or relying on clicking items.
            // Or maybe trigger a search filter on the current category page? No, that's complex.
            // Let's just focus input.
            inputRef.current?.blur();
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] bg-white dark:bg-slate-900 transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            {/* Header */}
            <div className="flex items-center gap-2 p-4 border-b border-slate-100 dark:border-slate-800">
                <button onClick={onClose} className="p-2 -ml-2 text-slate-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-icons-round text-2xl">arrow_back</span>
                </button>
                <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search products..."
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 pl-4 pr-10 text-base font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-900 dark:text-white"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <span className="material-icons-round text-lg">close</span>
                        </button>
                    )}
                </form>
            </div>

            {/* Results */}
            <div className="overflow-y-auto h-[calc(100vh-80px)] p-4">
                {isSearching ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                        {results.map((product) => (
                            <div
                                key={product.id}
                                className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl active:scale-[0.98] transition-all cursor-pointer"
                                onClick={() => handleSelect(product.id)}
                            >
                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-xl p-1 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
                                    <img
                                        src={product.images && product.images.length > 0 ? product.images[0] : ''}
                                        alt={product.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">{product.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-primary font-bold text-sm">{formatPrice(product.price)}</span>
                                        {product.originalPrice && (
                                            <span className="text-slate-400 text-xs line-through">{formatPrice(product.originalPrice)}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                                        <span>{product.category}</span>
                                        {product.subcategory && (
                                            <>
                                                <span>•</span>
                                                <span>{product.subcategory}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <span className="material-icons-round text-slate-300">chevron_right</span>
                            </div>
                        ))}
                    </div>
                ) : query.length > 1 ? (
                    <div className="text-center py-10 text-slate-500">
                        <span className="material-icons-round text-4xl mb-2 text-slate-300">search_off</span>
                        <p>No products found for "{query}"</p>
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        <span className="material-icons-round text-4xl mb-2 text-slate-200 dark:text-slate-800">search</span>
                        <p>Type to search...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
