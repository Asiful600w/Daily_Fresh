'use client';

export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="flex flex-col items-center">
                    <p className="text-slate-900 dark:text-white font-bold text-lg">Daily Fresh</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse">Preparing your dashboard...</p>
                </div>
            </div>
        </div>
    );
}
