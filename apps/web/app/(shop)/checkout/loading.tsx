export default function CheckoutLoading() {
    return (
        <div className="bg-[#f0f9f6] dark:bg-[#0d1b17] min-h-screen py-8 lg:py-12 animate-pulse">
            <div className="max-w-7xl mx-auto px-4">
                {/* Stepper */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded hidden md:block" />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-8" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white dark:bg-[#10221c] p-6 md:p-8 rounded-3xl border border-[#cfe7df] dark:border-[#1e3a31]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                                <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                                    <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                                </div>
                                <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                                    <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="bg-white dark:bg-[#10221c] p-6 md:p-8 rounded-3xl border border-[#cfe7df] dark:border-[#1e3a31]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                                <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                            <div className="h-16 bg-slate-50 dark:bg-slate-800 rounded-xl" />
                        </div>
                    </div>

                    {/* Right Column: Order Review */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-[#10221c] p-6 md:p-8 rounded-3xl border border-[#cfe7df] dark:border-[#1e3a31]">
                            <div className="h-8 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
                            <div className="space-y-4 mb-6">
                                {[1, 2].map(i => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                                            <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-700 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-14 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
