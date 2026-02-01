'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminNotificationProvider } from '@/context/AdminNotificationContext';
import { NotificationDropdown } from '@/components/admin/NotificationDropdown';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { useEffect } from 'react';

function AdminProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { adminUser, adminLoading, signOutAdmin } = useAdminAuth();

    const isPublicAdminPage = pathname === '/admin/login' || pathname === '/admin/register';

    useEffect(() => {
        if (!isPublicAdminPage && !adminLoading && !adminUser) {
            router.push('/admin/login');
        }
    }, [adminUser, adminLoading, router, isPublicAdminPage]);

    // Allow access to login and register page without auth check or dashboard layout
    if (isPublicAdminPage) {
        return <>{children}</>;
    }

    if (adminLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Loading Admin Panel...</p>
                </div>
            </div>
        );
    }

    if (!adminUser) return null;

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: 'dashboard' },

        // Orders: Visible to everyone, but filtered inside implementation
        { name: 'Orders', href: '/admin/orders', icon: 'shopping_bag' },

        // Products: Visible to everyone, but filtered inside implementation
        { name: 'Products', href: '/admin/products', icon: 'inventory_2' },

        // Super Admin Only Items
        ...(adminUser?.role === 'super_admin' ? [
            { name: 'Special Offers', href: '/admin/special-categories', icon: 'local_offer' },
            { name: 'Customers', href: '/admin/customers', icon: 'group' },
            { name: 'Merchants', href: '/admin/merchants', icon: 'admin_panel_settings' },
            { name: 'Categories', href: '/admin/categories', icon: 'category' }
        ] : []),

        // Reviews: Visible to everyone? Maybe restrict to super_admin for now if no specific merchant review logic exists yet
        // Task says "statistics... of their uploaded products" - implies reviews might be relevant but requires heavy filtering.
        // Let's hide for now to be safe or keep it if we implement filtering.
        // Plan didn't specify, but safer to hide complex things not yet implemented.
        ...(adminUser?.role === 'super_admin' ? [
            { name: 'Reviews', href: '/admin/reviews', icon: 'reviews' },
        ] : []),

        { name: 'Settings', href: '/admin/settings', icon: 'settings' },
    ];

    const activeItem = navItems.find(item => item.href === pathname) || navItems[0];
    const pageTitle = activeItem ? (activeItem.name === 'Dashboard' ? 'Dashboard Overview' : activeItem.name) : 'Dashboard Overview';

    return (
        <AdminNotificationProvider>
            <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-text-main font-sans">
                {/* Load Material Symbols */}
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
                <style jsx global>{`
                    .material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .active-nav {
                        background-color: #22C55E;
                        color: white;
                    }
                    .active-nav .material-symbols-outlined {
                        color: white; /* Ensure icon is white in active state */
                    }
                `}</style>
                <div
                    className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}
                ></div>

                {/* Sidebar Navigation */}
                <aside className="w-64 border-r border-border-subtle bg-white dark:bg-slate-800 sticky top-0 h-screen flex flex-col z-10 shadow-sm">
                    <div className="p-6 flex items-center gap-3">
                        <div className="bg-primary rounded-xl p-2 flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-white">storefront</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-text-main text-lg font-bold leading-none tracking-tight">Daily Fresh</h1>
                            <p className="text-text-muted text-xs font-bold uppercase tracking-wider mt-1">Admin Panel</p>
                        </div>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${isActive ? 'active-nav shadow-lg shadow-primary/20' : 'text-text-main hover:bg-primary/5 hover:translate-x-1'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined !text-[20px] transition-transform group-hover:scale-110 ${isActive ? '' : 'text-text-muted'}`}>{item.icon}</span>
                                    <span className="text-sm font-bold">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-4 border-t border-border-subtle bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary">person</span>
                            </div>
                            <div className="flex flex-col overflow-hidden flex-1">
                                <span className="text-xs font-bold text-text-main truncate">{adminUser?.email?.split('@')[0] || 'Admin'}</span>
                                <span className="text-[10px] text-text-muted truncate">Administrator</span>
                            </div>
                            <button
                                onClick={() => signOutAdmin()}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <span className="material-symbols-outlined !text-[18px]">logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden relative z-10">
                    {/* Top Navbar */}
                    <header className="flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-border-subtle sticky top-0 z-20 shrink-0">
                        <div className="flex items-center gap-6">
                            <h2 className="text-xl font-bold text-text-main">{pageTitle}</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
                            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 text-text-main transition-colors">
                                <span className="material-symbols-outlined">help_outline</span>
                            </button>
                            <div className="h-6 w-px bg-border-subtle mx-2"></div>
                            <div className="flex items-center gap-2 px-2 py-1 rounded-lg">
                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {adminUser?.email?.[0].toUpperCase() || 'A'}
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </AdminNotificationProvider>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminAuthProvider>
            <AdminProtectedLayout>{children}</AdminProtectedLayout>
        </AdminAuthProvider>
    );
}
