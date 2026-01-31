export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-slate-900">
            <div className="flex flex-col items-center gap-4">
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 animate-ping rounded-full bg-green-500 opacity-20"></div>
                    <div className="relative flex h-full w-full items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <span className="material-icons-round text-3xl animate-pulse">eco</span>
                    </div>
                </div>
                <p className="animate-pulse text-sm font-medium text-slate-500 dark:text-slate-400">
                    Loading Freshness...
                </p>
            </div>
        </div>
    );
}
