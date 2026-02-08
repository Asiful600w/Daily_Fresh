'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white font-sans">
                <div className="flex h-screen w-full flex-col items-center justify-center p-4">
                    <div className="flex max-w-md flex-col items-center gap-6 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-900/30">
                            <span className="material-symbols-outlined !text-[40px]">warning</span>
                        </div>
                        <h2 className="text-2xl font-bold">Critical Admin Error</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            A critical error occurred in the admin layout. Please reload the application.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
