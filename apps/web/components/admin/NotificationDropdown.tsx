'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAdminNotification } from '@/context/AdminNotificationContext';
import { formatPrice } from '@/lib/format';
import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown() {
    const { notifications, unreadCount, markAsViewed, markAllAsViewed } = useAdminNotification();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = async (orderId: string) => {
        await markAsViewed(orderId);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 text-text-main relative transition-colors focus:outline-none"
            >
                <span className={`material-symbols-outlined ${unreadCount > 0 ? 'text-primary' : ''}`}>
                    notifications
                </span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 text-[10px] font-bold text-white shadow-sm z-10 leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-border-subtle z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-gray-50 dark:bg-slate-900/50">
                        <h3 className="font-bold text-text-main">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsViewed}
                                className="text-xs font-bold text-primary hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-text-muted flex flex-col items-center gap-2">
                                <span className="material-symbols-outlined text-4xl opacity-50">notifications_off</span>
                                <p className="text-sm">No new notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border-subtle">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification.id)}
                                        className="p-4 hover:bg-primary/5 cursor-pointer transition-colors flex gap-3 items-start group relative"
                                    >
                                        {!notification.is_admin_viewed && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                                        )}
                                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-text-main truncate">
                                                New Order #{notification.id.slice(0, 8)}
                                            </p>
                                            <p className="text-xs text-text-muted mt-0.5">
                                                {notification.shipping_name || 'Customer'} placed an order worth{' '}
                                                <span className="font-bold text-text-main">{formatPrice(notification.total_amount)}</span>
                                            </p>
                                            <p className="text-[10px] text-text-muted mt-2 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[10px]">schedule</span>
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-border-subtle bg-gray-50 dark:bg-slate-900/50">
                        <Link
                            href="/admin/orders"
                            onClick={() => setIsOpen(false)}
                            className="block w-full text-center py-2 text-xs font-bold text-text-muted hover:text-primary transition-colors"
                        >
                            View All Orders
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
