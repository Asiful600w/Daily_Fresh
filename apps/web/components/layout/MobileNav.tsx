export function MobileNav() {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:hidden z-50 flex items-center justify-around py-4">
            <button className="flex flex-col items-center gap-1 text-primary">
                <span className="material-icons-round">home</span>
                <span className="text-[10px] font-bold">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400">
                <span className="material-icons-round">category</span>
                <span className="text-[10px] font-medium">Categories</span>
            </button>
            <div className="-mt-8">
                <button className="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center border-4 border-white dark:border-slate-900">
                    <span className="material-icons-round">shopping_basket</span>
                </button>
            </div>
            <button className="flex flex-col items-center gap-1 text-slate-400">
                <span className="material-icons-round">favorite_border</span>
                <span className="text-[10px] font-medium">Wishlist</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400">
                <span className="material-icons-round">person_outline</span>
                <span className="text-[10px] font-medium">Profile</span>
            </button>
        </div>
    );
}
