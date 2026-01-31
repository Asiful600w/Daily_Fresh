'use client';
import React from 'react';
import { CURRENCY_SYMBOL } from '@/lib/format';

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
    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.min(Number(e.target.value), currentMax - 1);
        onPriceChange(val, currentMax);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.max(Number(e.target.value), currentMin + 1);
        onPriceChange(currentMin, val);
    };

    const minPercent = ((currentMin - minPrice) / (maxPrice - minPrice)) * 100;
    const maxPercent = ((currentMax - minPrice) / (maxPrice - minPrice)) * 100;

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
                        <div className="flex justify-between items-end mb-6">
                            <h4 className="font-bold text-slate-900 dark:text-white">Price Range</h4>
                            <span className="text-primary font-bold text-base">
                                {CURRENCY_SYMBOL}{currentMin} - {CURRENCY_SYMBOL}{currentMax}
                            </span>
                        </div>
                        <div className="px-2 relative h-10">
                            <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full -translate-y-1/2 z-0"></div>
                            <div
                                className="absolute top-1/2 h-1.5 bg-primary rounded-full -translate-y-1/2 z-10"
                                style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                            ></div>
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
                    </section>

                    {/* Attributes */}
                    <section>
                        <h4 className="font-bold mb-4 text-slate-900 dark:text-white">Attributes</h4>
                        <label className="flex items-center gap-3 cursor-pointer group p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                            <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center peer-checked:border-primary">
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
                <style jsx>{`
                    input[type=range]::-webkit-slider-thumb {
                        pointer-events: auto;
                        -webkit-appearance: none;
                        height: 24px;
                        width: 24px;
                        border-radius: 50%;
                        background: #ffffff;
                        border: 2px solid #22c55e;
                        cursor: pointer;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        margin-top: -9px;
                    }
                    input[type=range]::-moz-range-thumb {
                        pointer-events: auto;
                        height: 24px;
                        width: 24px;
                        border-radius: 50%;
                        background: #ffffff;
                        border: 2px solid #22c55e;
                        cursor: pointer;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        border: none;
                    } 
                `}</style>
            </div>
        </div>
    );
}
