
export default function Loading() {
    return (
        <main className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
            {/* Breadcrumbs Skeleton */}
            <div className="flex items-center gap-2 mb-8 h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-md"></div>

            {/* Product Info Skeleton */}
            <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Gallery Skeleton */}
                <div className="space-y-4">
                    <div className="aspect-[4/5] w-full bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                        ))}
                    </div>
                </div>

                {/* Details Skeleton */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="h-4 w-24 bg-primary/20 rounded-full"></div>
                        <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                        <div className="flex gap-4">
                            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                        </div>
                    </div>

                    <div className="h-32 w-full bg-slate-200 dark:bg-slate-700 rounded-xl"></div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                        <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                    </div>

                    <div className="h-14 w-full bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                </div>
            </div>

            {/* Reviews Skeleton */}
            <div className="space-y-6 mb-16">
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-32 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                    ))}
                </div>
            </div>

            {/* Related Products Skeleton */}
            <div className="space-y-6">
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[4/5] w-full bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                    ))}
                </div>
            </div>
        </main>
    );
}
