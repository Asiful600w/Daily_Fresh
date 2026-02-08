'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Admin Error:', error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
            <div className="flex max-w-md flex-col items-center gap-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-900/20">
                    <span className="material-symbols-outlined !text-[40px]">error</span>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Admin Panel Error
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Something went wrong while loading the admin interface.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        Reload Page
                    </button>
                    <button
                        onClick={reset}
                        className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                    >
                        Try Again
                    </button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 max-h-40 w-full overflow-auto rounded-lg bg-red-50/50 p-4 text-left text-xs text-red-800 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/40">
                        <p className="font-mono">{error.message}</p>
                        {error.digest && <p className="mt-1 font-mono opacity-60 text-xs">Digest: {error.digest}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
