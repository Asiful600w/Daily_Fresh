'use client';

import React, { useState, useRef, useCallback } from 'react';
import { CURRENCY_SYMBOL } from '@/lib/format';

interface PriceRangeSliderProps {
    min: number;
    max: number;
    currentMin: number;
    currentMax: number;
    onChange: (min: number, max: number) => void;
    step?: number;
}

export function PriceRangeSlider({
    min,
    max,
    currentMin,
    currentMax,
    onChange,
    step = 1
}: PriceRangeSliderProps) {
    const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

    // Provide immediate visual feedback while dragging
    const [localMin, setLocalMin] = useState(currentMin);
    const [localMax, setLocalMax] = useState(currentMax);

    // Sync with props when they change externally (e.g., URL or clear filters)
    const [prevCurrentMin, setPrevCurrentMin] = useState(currentMin);
    const [prevCurrentMax, setPrevCurrentMax] = useState(currentMax);

    if (currentMin !== prevCurrentMin || currentMax !== prevCurrentMax) {
        setPrevCurrentMin(currentMin);
        setPrevCurrentMax(currentMax);
        setLocalMin(currentMin);
        setLocalMax(currentMax);
    }

    const getPercent = useCallback(
        (value: number) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Number(e.target.value), localMax - step);
        setLocalMin(value);
        onChange(value, localMax);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(e.target.value), localMin + step);
        setLocalMax(value);
        onChange(localMin, value);
    };

    return (
        <div className="w-full space-y-6 py-4">
            <div className="relative w-full h-2 px-2">
                {/* Track Background */}
                <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full -translate-y-1/2" />

                {/* Active Range Highlight */}
                <div
                    className="absolute top-1/2 h-1.5 bg-gradient-to-r from-primary/80 to-primary rounded-full -translate-y-1/2 transition-[left,right] duration-150"
                    style={{
                        left: `${getPercent(localMin)}%`,
                        right: `${100 - getPercent(localMax)}%`
                    }}
                />

                {/* Range Inputs */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localMin}
                    onChange={handleMinChange}
                    onMouseDown={() => setIsDragging('min')}
                    onMouseUp={() => setIsDragging(null)}
                    onTouchStart={() => setIsDragging('min')}
                    onTouchEnd={() => setIsDragging(null)}
                    className="absolute w-full top-1/2 -translate-y-1/2 h-1.5 pointer-events-none appearance-none bg-transparent active:z-50 z-30 slider-thumb-premium"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localMax}
                    onChange={handleMaxChange}
                    onMouseDown={() => setIsDragging('max')}
                    onMouseUp={() => setIsDragging(null)}
                    onTouchStart={() => setIsDragging('max')}
                    onTouchEnd={() => setIsDragging(null)}
                    className="absolute w-full top-1/2 -translate-y-1/2 h-1.5 pointer-events-none appearance-none bg-transparent active:z-50 z-40 slider-thumb-premium"
                />

                {/* Floating Tooltips */}
                {(isDragging === 'min' || isDragging === 'max') && (
                    <>
                        <div
                            className="absolute -top-10 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-bold rounded-md shadow-xl transition-all duration-75 -translate-x-1/2 pointer-events-none z-[60]"
                            style={{ left: `${getPercent(localMin)}%` }}
                        >
                            {CURRENCY_SYMBOL}{localMin}
                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45" />
                        </div>
                        <div
                            className="absolute -top-10 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-bold rounded-md shadow-xl transition-all duration-75 -translate-x-1/2 pointer-events-none z-[60]"
                            style={{ left: `${getPercent(localMax)}%` }}
                        >
                            {CURRENCY_SYMBOL}{localMax}
                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45" />
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Min Price</span>
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-all hover:border-primary/30">
                        <span className="text-xs font-bold text-primary">{CURRENCY_SYMBOL}</span>
                        <input
                            type="number"
                            value={localMin}
                            onChange={(e) => handleMinChange(e as any)}
                            className="w-12 bg-transparent border-none p-0 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-0"
                        />
                    </div>
                </div>
                <div className="h-px w-4 bg-slate-200 dark:bg-slate-800 self-end mb-4" />
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Max Price</span>
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-all hover:border-primary/30">
                        <span className="text-xs font-bold text-primary">{CURRENCY_SYMBOL}</span>
                        <input
                            type="number"
                            value={localMax}
                            onChange={(e) => handleMaxChange(e as any)}
                            className="w-12 bg-transparent border-none p-0 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-0 text-right"
                        />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .slider-thumb-premium::-webkit-slider-thumb {
                    pointer-events: auto;
                    appearance: none;
                    width: 22px;
                    height: 22px;
                    background: #ffffff;
                    border: 3px solid #22c55e;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1), 0 0 0 0px rgba(34, 197, 94, 0.2);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .slider-thumb-premium:active::-webkit-slider-thumb {
                    transform: scale(1.15);
                    box-shadow: 0 8px 15px rgba(0,0,0,0.15), 0 0 0 8px rgba(34, 197, 94, 0.1);
                }
                .slider-thumb-premium::-moz-range-thumb {
                    pointer-events: auto;
                    width: 18px;
                    height: 18px;
                    background: #ffffff;
                    border: 3px solid #22c55e;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    border: none;
                }
            `}</style>
        </div>
    );
}
