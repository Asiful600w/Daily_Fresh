'use client';
import React, { useEffect, useState } from 'react';

export function PWAInstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return sessionStorage.getItem('pwa-banner-dismissed') === 'true';
    });

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Show the banner
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if already installed
        window.addEventListener('appinstalled', () => {
            setIsVisible(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        sessionStorage.setItem('pwa-banner-dismissed', 'true');
    };

    if (!isVisible || isDismissed) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:w-96 z-[9999] animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4 relative overflow-hidden group">
                {/* Visual Background Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <span className="material-icons-round text-3xl">install_mobile</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight">Install Daily Fresh</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Get the best shopping experience on your home screen.</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleInstallClick}
                        className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors"
                    >
                        Install
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}
