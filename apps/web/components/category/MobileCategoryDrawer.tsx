'use client';
import React, { useState } from 'react';
import { Category } from '@/lib/api';
import Link from 'next/link';

interface MobileCategoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
}

export function MobileCategoryDrawer({ isOpen, onClose, categories }: MobileCategoryDrawerProps) {
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Reset selection when closing
    React.useEffect(() => {
        if (!isOpen) {
            // slightly delay reset to avoid UI jumping before animation ends
            const timer = setTimeout(() => setSelectedCategory(null), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle Back Button to Close Drawer
    const isClosingViaBack = React.useRef(false);

    React.useEffect(() => {
        if (isOpen) {
            isClosingViaBack.current = false;
            // Push a new state to history when drawer opens
            window.history.pushState({ drawerOpen: true }, '', window.location.href);

            const handlePopState = () => {
                isClosingViaBack.current = true;
                onClose();
            };

            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
                // If not closed via back button (i.e. closed via UI), remove the history item
                if (!isClosingViaBack.current) {
                    window.history.back();
                }
            };
        }
    }, [isOpen, onClose]);

    return (
        <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl transition-transform duration-300 flex flex-col max-h-[85vh] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>

                {/* Handle Bar */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                    {selectedCategory ? (
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                        >
                            <span className="material-icons-round text-lg">arrow_back</span>
                            Back
                        </button>
                    ) : (
                        <span className="text-lg font-bold text-slate-900 dark:text-white">Categories</span>
                    )}

                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-4 flex-1">
                    {selectedCategory ? (
                        // Subcategories View
                        <div className="space-y-2 animate-in slide-in-from-right-10 fade-in duration-200">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 px-2">{selectedCategory.name}</h3>

                            <Link
                                href={`/category/${selectedCategory.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                                className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl hover:bg-primary/10 transition-colors group"
                                onClick={onClose}
                            >
                                <span className="font-bold text-primary">Shop All {selectedCategory.name}</span>
                                <span className="material-icons-round text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {selectedCategory.subcategories.map((sub) => (
                                    <Link
                                        key={sub.name}
                                        href={`/category/${selectedCategory.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}?subcategory=${encodeURIComponent(sub.name)}`}
                                        className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all text-center gap-2"
                                        onClick={onClose}
                                    >
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{sub.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Main Categories View
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category)}
                                    className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:shadow-md transition-all group"
                                >
                                    <div className="w-12 h-12 mb-3 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm text-2xl group-hover:scale-110 transition-transform">
                                        {/* You might want to map category names to icons or image URLs if available */}
                                        {/* For now using first letter or generic icon if no image */}
                                        {category.img ? (
                                            <img src={category.img} alt={category.name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <span className="material-icons-round text-primary">category</span>
                                        )}
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white text-sm">{category.name}</span>
                                    <span className="text-xs text-slate-400 mt-1">{category.subcategories.length} Items</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
