'use client';
import React from 'react';
import { PriceRangeSlider } from '../ui/PriceRangeSlider';

interface MobileFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    minPrice: number;
    maxPrice: number;
    currentMin: number;
    currentMax: number;
    onPriceChange: (min: number, max: number) => void;
}

export function MobileFilterDrawer({
    isOpen,
    onClose,
    minPrice,
    maxPrice,
    currentMin,
    currentMax,
    onPriceChange
}: MobileFilterDrawerProps) {
    return (
        <div className={`fixed inset-0 z-[100] transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl transition-transform duration-300 p-6 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />

                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Filters</h3>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="space-y-8 pb-Safe">
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

                    {/* Attributes */}
                    <section>
                        <h4 className="font-bold mb-4 text-slate-900 dark:text-white">Attributes</h4>
                        <label className="flex items-center gap-3 cursor-pointer group p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                            <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center">
                                <input defaultChecked className="hidden peer" type="checkbox" />
                                <div className="w-2.5 h-2.5 bg-primary rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Organic Only</span>
                        </label>
                    </section>

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
