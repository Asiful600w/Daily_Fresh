
export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
            {/* Search / Header Skeleton for Mobile */}
            <div className="md:hidden h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>

            {/* Hero Section Skeleton */}
            <div className="relative aspect-[2/1] md:aspect-[3/1] w-full bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
            </div>

            {/* Category Scroller Skeleton */}
            <div className="space-y-4">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2 min-w-[80px]">
                            <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Product Grid Skeleton (Best Selling) */}
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-3">
                            <div className="aspect-[4/5] w-full bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mt-2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Banner Skeleton */}
            <div className="h-32 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>

            {/* Product Grid Skeleton (Featured) */}
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-3">
                            <div className="aspect-[4/5] w-full bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mt-2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
