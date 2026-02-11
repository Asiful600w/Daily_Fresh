export default function CartLoading() {
    return (
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 xl:px-40 py-8 animate-pulse">
            {/* Stepper Skeleton */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded hidden md:block" />
                    </div>
                ))}
            </div>

            {/* Breadcrumbs */}
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-6" />

            {/* Title */}
            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-8" />

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Items */}
                <div className="flex-1 flex flex-col gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl">
                            <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-xl shrink-0" />
                            <div className="flex-1 space-y-3">
                                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                                <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-80 h-64 bg-white dark:bg-slate-800 rounded-2xl p-6">
                    <div className="space-y-4">
                        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl mt-4" />
                    </div>
                </div>
            </div>
        </main>
    );
}
