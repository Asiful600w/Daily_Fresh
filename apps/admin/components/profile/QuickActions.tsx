'use client';

export function QuickActions() {
    return (
        <>
            <h2 className="text-[#0d1b17] dark:text-white text-xl font-bold px-2 mt-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#10221c] border border-[#cfe7df] dark:border-[#1e3a31] hover:border-primary transition-colors">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <span className="material-icons-round">receipt_long</span>
                    </div>
                    <span className="text-xs font-bold">Baskets</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#10221c] border border-[#cfe7df] dark:border-[#1e3a31] hover:border-primary transition-colors">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <span className="material-icons-round">support_agent</span>
                    </div>
                    <span className="text-xs font-bold">Help Center</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#10221c] border border-[#cfe7df] dark:border-[#1e3a31] hover:border-primary transition-colors">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <span className="material-icons-round">redeem</span>
                    </div>
                    <span className="text-xs font-bold">Promos</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#10221c] border border-[#cfe7df] dark:border-[#1e3a31] hover:border-primary transition-colors">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <span className="material-icons-round">wallet</span>
                    </div>
                    <span className="text-xs font-bold">Vouchers</span>
                </button>
            </div>
        </>
    );
}
