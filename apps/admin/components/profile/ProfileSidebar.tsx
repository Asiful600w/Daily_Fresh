'use client';
import Link from 'next/link';
import NextImage from 'next/image';
import { useAuth } from '@/context/AuthContext';

export function ProfileSidebar({ activeTab = 'overview' }: { activeTab?: string }) {
    const { user } = useAuth();

    return (
        <aside className="hidden lg:flex w-72 flex-col border-r border-[#cfe7df] dark:border-[#1e3a31] bg-white dark:bg-[#10221c] p-6 h-[calc(100vh-64px)] sticky top-16">
            <div className="flex flex-col h-full justify-between">
                <div className="flex flex-col gap-8">
                    <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group">
                        <span className="material-icons-round text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span className="font-semibold">Back to Home</span>
                    </Link>

                    <div className="flex gap-3 items-center">
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 border-2 border-primary overflow-hidden relative">
                            {user?.user_metadata?.avatar_url ? (
                                <NextImage
                                    src={user.user_metadata.avatar_url}
                                    alt="Profile"
                                    className="object-cover"
                                    fill
                                    sizes="48px"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                    <span className="material-icons-round text-slate-400">person</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-[#0d1b17] dark:text-white text-base font-bold leading-none">
                                {user?.user_metadata?.full_name || 'User'}
                            </h1>
                            <p className="text-[#4c9a80] text-xs font-normal mt-1">Prime Member</p>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-2">
                        <Link href="/profile" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-primary/10 text-primary' : 'hover:bg-[#e7f3ef] dark:hover:bg-[#1e3a31] text-[#0d1b17] dark:text-white'}`}>
                            <span className="material-icons-round">account_circle</span>
                            <span className="text-sm font-semibold">Profile Overview</span>
                        </Link>
                        <Link href="/profile/orders" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-primary/10 text-primary' : 'hover:bg-[#e7f3ef] dark:hover:bg-[#1e3a31] text-[#0d1b17] dark:text-white'}`}>
                            <span className="material-icons-round">shopping_bag</span>
                            <span className="text-sm font-medium">My Orders</span>
                        </Link>
                        <Link href="/profile/wishlist" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeTab === 'wishlist' ? 'bg-primary/10 text-primary' : 'hover:bg-[#e7f3ef] dark:hover:bg-[#1e3a31] text-[#0d1b17] dark:text-white'}`}>
                            <span className="material-icons-round">favorite</span>
                            <span className="text-sm font-medium">Wishlist</span>
                        </Link>
                        <Link href="/profile/addresses" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeTab === 'addresses' ? 'bg-primary/10 text-primary' : 'hover:bg-[#e7f3ef] dark:hover:bg-[#1e3a31] text-[#0d1b17] dark:text-white'}`}>
                            <span className="material-icons-round">location_on</span>
                            <span className="text-sm font-medium">Saved Addresses</span>
                        </Link>
                        <Link href="/profile/payment" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeTab === 'payment' ? 'bg-primary/10 text-primary' : 'hover:bg-[#e7f3ef] dark:hover:bg-[#1e3a31] text-[#0d1b17] dark:text-white'}`}>
                            <span className="material-icons-round">credit_card</span>
                            <span className="text-sm font-medium">Payment Methods</span>
                        </Link>
                        <Link href="/profile/settings" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors mt-4 border-t border-[#cfe7df] pt-6 ${activeTab === 'settings' ? 'bg-primary/10 text-primary' : 'hover:bg-[#e7f3ef] dark:hover:bg-[#1e3a31] text-[#0d1b17] dark:text-white'}`}>
                            <span className="material-icons-round">settings</span>
                            <span className="text-sm font-medium">Settings</span>
                        </Link>
                    </nav>
                </div>
                <button className="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 bg-primary text-[#0d1b17] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                    <span className="material-icons-round mr-2">edit</span>
                    <span>Edit Profile</span>
                </button>
            </div>
        </aside>
    );
}
