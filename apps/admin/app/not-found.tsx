'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
                    Page Not Found
                </h2>
                <p className="text-slate-500 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link
                    href="/admin"
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
}
