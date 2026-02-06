'use client';

import Link from 'next/link';

export default function ForbiddenPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
                <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
                    Access Denied
                </h2>
                <p className="text-slate-500 mb-8">
                    You don't have permission to access this page.
                </p>
                <Link
                    href="/admin/login"
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    Go to Login
                </Link>
            </div>
        </div>
    );
}
