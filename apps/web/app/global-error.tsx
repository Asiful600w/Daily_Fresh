'use client';

export default function GlobalError({
    _error,
    _reset,
}: {
    _error: Error & { digest?: string };
    _reset: () => void;
}) {
    return (
        <html>
            <body className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                <div className="flex h-screen w-full flex-col items-center justify-center p-4">
                    <div className="flex max-w-md flex-col items-center gap-6 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-900/20">
                            <span className="material-icons-round text-4xl">dns</span>
                        </div>
                        <h2 className="text-2xl font-bold">Critical Error</h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            A critical system error occurred. Please reload the application.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
