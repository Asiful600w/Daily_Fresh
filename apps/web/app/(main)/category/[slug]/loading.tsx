
export default function Loading() {
    return (
        <main className="max-w-[1400px] mx-auto px-6 py-8 animate-pulse">
            {/* Breadcrumbs Skeleton */}
            <div className="flex items-center gap-2 mb-6">
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>

            {/* Category Hero Skeleton */}
            <div className="mb-8 w-full aspect-[4/1] md:aspect-[5/1] bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>

            {/* Filter & Sort Bar Skeleton - Optional but adds structure */}
            <div className="flex justify-between items-center mb-6">
                <div className="hidden md:block h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="ml-auto h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>

            <div className="flex gap-8">
                {/* Sidebar Filter Skeleton (Desktop) */}
                <div className="hidden lg:block w-64 space-y-6 flex-shrink-0">
                    <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-3">
                            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="space-y-2 pl-2">
                                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Product Grid Skeleton */}
                <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="space-y-3">
                                <div className="aspect-[4/5] w-full bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
