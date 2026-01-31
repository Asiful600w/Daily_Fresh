import Link from 'next/link';

export function MobileNav() {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:hidden z-50 flex items-center justify-around py-4 pb-safe safe-area-inset-bottom">
            <Link href="/" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary active:text-primary transition-colors">
                <span className="material-icons-round">home</span>
                <span className="text-[10px] font-bold">Home</span>
            </Link>
            <Link href="/category/all" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary active:text-primary transition-colors">
                <span className="material-icons-round">category</span>
                <span className="text-[10px] font-medium">Categories</span>
            </Link>
            <div className="-mt-8">
                <Link href="/cart" id="mobile-cart-icon-container" className="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center border-4 border-white dark:border-slate-900 active:scale-95 transition-transform">
                    <span className="material-icons-round">shopping_basket</span>
                </Link>
            </div>
            <Link href="/profile" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary active:text-primary transition-colors">
                <span className="material-icons-round">favorite_border</span>
                <span className="text-[10px] font-medium">Wishlist</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary active:text-primary transition-colors">
                <span className="material-icons-round">person_outline</span>
                <span className="text-[10px] font-medium">Profile</span>
            </Link>
        </div>
    );
}
