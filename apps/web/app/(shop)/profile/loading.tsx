export default function ProfileLoading() {
    return (
        <div className="flex justify-center bg-background-light dark:bg-background-dark min-h-screen animate-pulse">
            <div className="flex w-full max-w-7xl">
                {/* Sidebar Skeleton (Desktop) */}
                <aside className="hidden lg:flex flex-col w-72 p-6 border-r border-slate-100 dark:border-slate-800 space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex flex-col flex-1 p-4 md:p-8 w-full">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center gap-4 mb-8 bg-white dark:bg-slate-800 p-4 rounded-2xl">
                        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <div className="flex-1 space-y-2">
                            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                    </div>

                    {/* Page Heading */}
                    <div className="mb-8 space-y-2">
                        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-24 bg-white dark:bg-slate-800 rounded-2xl" />
                        ))}
                    </div>

                    {/* Grid Content */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 space-y-8">
                            <div className="h-64 bg-white dark:bg-slate-800 rounded-2xl" />
                            <div className="h-40 bg-white dark:bg-slate-800 rounded-2xl" />
                        </div>
                        <div className="space-y-6">
                            <div className="h-40 bg-white dark:bg-slate-800 rounded-2xl" />
                            <div className="h-32 bg-white dark:bg-slate-800 rounded-2xl" />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
