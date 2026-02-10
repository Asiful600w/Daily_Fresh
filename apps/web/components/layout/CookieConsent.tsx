'use client';

import React, { useState, useEffect } from 'react';

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Delay to not pop up immediately
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto md:min-w-[400px] z-[200] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">

                <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <span className="material-icons-round text-primary text-3xl animate-pulse">cookie</span>
                </div>

                <div className="flex-1 space-y-1 text-center md:text-left">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Experience Fast Loading</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                        We use site caching to ensure you get the best and fastest shopping experience.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="flex-1 md:flex-none px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                        Later
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none px-8 py-3 bg-primary hover:bg-primary-dark text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-primary/25 transition-all active:scale-95"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
