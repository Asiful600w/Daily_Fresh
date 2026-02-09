'use client';

export function QuickActions() {
    return (
        <>
            <h2 className="text-[#0d1b17] dark:text-white text-xl font-bold px-2 mt-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button className="relative flex flex-col items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#10221c] border border-[#cfe7df] dark:border-[#1e3a31] hover:border-primary transition-colors group">
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[8px] font-black text-slate-500 uppercase tracking-tighter">Soon</span>
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <span className="material-icons-round">receipt_long</span>
                    </div>
                    <span className="text-xs font-bold">Baskets</span>
                </button>
                <button className="relative flex flex-col items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#10221c] border border-[#cfe7df] dark:border-[#1e3a31] hover:border-primary transition-colors group">
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[8px] font-black text-slate-500 uppercase tracking-tighter">Soon</span>
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <span className="material-icons-round">support_agent</span>
                    </div>
                    <span className="text-xs font-bold">Help Center</span>
                </button>
                <button className="relative flex flex-col items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#10221c] border border-[#cfe7df] dark:border-[#1e3a31] hover:border-primary transition-colors group">
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[8px] font-black text-slate-500 uppercase tracking-tighter">Soon</span>
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <span className="material-icons-round">redeem</span>
                    </div>
                    <span className="text-xs font-bold">Promos</span>
                </button>
                <button className="relative flex flex-col items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#10221c] border border-[#cfe7df] dark:border-[#1e3a31] hover:border-primary transition-colors group">
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[8px] font-black text-slate-500 uppercase tracking-tighter">Soon</span>
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <span className="material-icons-round">wallet</span>
                    </div>
                    <span className="text-xs font-bold">Vouchers</span>
                </button>
            </div>
        </>
    );
}
