import { formatPrice } from '@/lib/format';

export function ProfileStats({ stats }: { stats: any }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <div className="flex flex-col gap-2 rounded-2xl p-6 bg-white dark:bg-[#10221c] border border-[#cfe7df] dark:border-[#1e3a31] shadow-sm">
                <div className="flex justify-between items-start">
                    <p className="text-[#4c9a80] text-sm font-medium">Active Orders</p>
                    <span className="material-icons-round text-primary">local_shipping</span>
                </div>
                <p className="text-[#0d1b17] dark:text-white text-3xl font-bold">{stats.activeOrders}</p>
                <div className="flex items-center gap-1 text-[#07882e] text-xs font-bold">
                    <span className="material-icons-round text-sm">trending_up</span>
                    <span>+1 from last week</span>
                </div>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl p-6 bg-white dark:bg-[#10221c] border border-[#cfe7df] dark:border-[#1e3a31] shadow-sm">
                <div className="flex justify-between items-start">
                    <p className="text-[#4c9a80] text-sm font-medium">Pending Orders</p>
                    <span className="material-icons-round text-[#facc15]">inventory_2</span>
                </div>
                <p className="text-[#0d1b17] dark:text-white text-3xl font-bold">{stats.pendingOrders}</p>
                <div className="flex items-center gap-1 text-[#07882e] text-xs font-bold">
                    <span className="material-icons-round text-sm">hourglass_empty</span>
                    <span>Awaiting processing</span>
                </div>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl p-6 bg-white dark:bg-[#10221c] border border-[#cfe7df] dark:border-[#1e3a31] shadow-sm">
                <div className="flex justify-between items-start">
                    <p className="text-[#4c9a80] text-sm font-medium">Saved Items</p>
                    <span className="material-icons-round text-[#ef4444]">favorite</span>
                </div>
                <p className="text-[#0d1b17] dark:text-white text-3xl font-bold">{stats.savedItems}</p>
                <div className="flex items-center gap-1 text-[#4c9a80] text-xs font-bold">
                    <span>No changes today</span>
                </div>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl p-6 bg-white dark:bg-[#10221c] border border-[#cfe7df] dark:border-[#1e3a31] shadow-sm">
                <div className="flex justify-between items-start">
                    <p className="text-[#4c9a80] text-sm font-medium">Completed Orders</p>
                    <span className="material-icons-round text-[#07882e]">check_circle</span>
                </div>
                <p className="text-[#0d1b17] dark:text-white text-3xl font-bold">{stats.completedOrders}</p>
                <div className="flex items-center gap-1 text-[#07882e] text-xs font-bold">
                    <span className="material-icons-round text-sm">payments</span>
                    <span>Total Spent: {formatPrice(stats.totalSpent)}</span>
                </div>
            </div>
        </div>
    );
}
