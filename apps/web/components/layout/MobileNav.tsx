'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { MobileCategoryDrawer } from '@/components/category/MobileCategoryDrawer';
import { Category } from '@/lib/api';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

interface MobileNavProps {
    categories: Category[];
}

export function MobileNav({ categories }: MobileNavProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const { totalItems } = useCart();

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname?.startsWith(path);
    };

    const handleNav = (e: React.MouseEvent, path: string) => {
        // We use router.push instead of pure Link for wishlist/profile 
        // to ensure the top loader triggers immediately.
        e.preventDefault();
        setIsLoading(path);
        router.push(path);
    };

    // Reset loading state on pathname change
    React.useEffect(() => {
        setIsLoading(null);
    }, [pathname]);

    // Hide on login/signup/product pages
    if (pathname === '/login' || pathname === '/signup' || pathname?.startsWith('/product/')) {
        return null;
    }

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:hidden z-[90] flex items-center justify-around py-4 pb-safe safe-area-inset-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <Link href="/" onClick={(e) => handleNav(e, '/')} className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isActive('/') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                    <div className="relative">
                        <span className="material-icons-round text-2xl">home</span>
                        {isLoading === '/' && (
                            <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full" />
                        )}
                    </div>
                    <span className="text-[10px] font-bold">Home</span>
                </Link>

                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isDrawerOpen ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    <span className="material-icons-round text-2xl">grid_view</span>
                    <span className="text-[10px] font-bold">Categories</span>
                </button>

                {/* Cart Icon with Badge */}
                <div className="-mt-8 relative">
                    <Link href="/cart" id="mobile-cart-icon-container" className="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center border-4 border-white dark:border-slate-900 active:scale-95 transition-transform overflow-visible">
                        <span className="material-icons-round text-2xl">shopping_basket</span>
                        {totalItems > 0 && (
                            <span className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-bounce-in">
                                {totalItems > 99 ? '99+' : totalItems}
                            </span>
                        )}
                    </Link>
                </div>

                <Link
                    href="/profile/wishlist"
                    onClick={(e) => handleNav(e, '/profile/wishlist')}
                    className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isActive('/profile/wishlist') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    <div className="relative">
                        <span className="material-icons-round text-2xl">favorite</span>
                        {isLoading === '/profile/wishlist' && (
                            <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full" />
                        )}
                    </div>
                    <span className="text-[10px] font-bold">Wishlist</span>
                </Link>

                <Link
                    href="/profile"
                    onClick={(e) => handleNav(e, '/profile')}
                    className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isActive('/profile') && !isActive('/profile/wishlist') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    <div className="relative">
                        <span className="material-icons-round text-2xl">person</span>
                        {isLoading === '/profile' && (
                            <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full" />
                        )}
                    </div>
                    <span className="text-[10px] font-bold">Profile</span>
                </Link>
            </div>

            <MobileCategoryDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                categories={categories}
            />
        </>
    );
}
