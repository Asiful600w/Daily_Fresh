'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUnreadNotifications, markNotificationAsViewed, markAllNotificationsAsViewed, OrderNotification } from '@/actions/notifications';
import { createClient } from '@/lib/supabase/client';
import { NOTIFICATION_SOUND } from '@/constants/sounds';

interface AdminNotificationContextType {
    notifications: OrderNotification[];
    unreadCount: number;
    markAsViewed: (orderId: string) => Promise<void>;
    markAllAsViewed: () => Promise<void>;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<OrderNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const notificationsRef = useRef<OrderNotification[]>([]);

    // Keep ref in sync with state
    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio(NOTIFICATION_SOUND);
    }, []);

    const playNotificationSound = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.error("Error playing sound/Interaction needed:", e));
        }
    };

    const fetchNotifications = useCallback(async (checkForNew: boolean = false) => {
        try {
            const data = await getUnreadNotifications();
            // Use ref for comparison to avoid dependency cycle
            const currentNotifications = notificationsRef.current;

            if (checkForNew && data.length > currentNotifications.length) {
                // New notification arrived
                playNotificationSound();
            }

            setNotifications(data);
            setUnreadCount(data.length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    }, []);

    // eslint-disable-next-line
    useEffect(() => {
        // Initial fetch
        fetchNotifications(false);

        // Set up Realtime subscription for new orders
        const supabaseClient = createClient();

        const channel = supabaseClient
            .channel('admin-orders-realtime')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('New order received:', payload.new);
                    // Play notification sound
                    playNotificationSound();
                    // Refresh notifications to include the new order
                    fetchNotifications(false);
                }
            )
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('Order updated:', payload.new);
                    // Refresh to update order status in notifications
                    fetchNotifications(false);
                }
            )
            .subscribe();

        return () => {
            supabaseClient.removeChannel(channel);
        };
    }, [fetchNotifications]);

    const markAsViewed = useCallback(async (orderId: string) => {
        try {
            await markNotificationAsViewed(orderId);
            setNotifications(prev => prev.filter(n => n.id !== orderId));
            setUnreadCount(prev => Math.max(0, prev - 1));
            router.push(`/admin/orders/${orderId}`);
        } catch (error) {
            console.error("Failed to mark as viewed", error);
        }
    }, [router]);

    const markAllAsViewed = useCallback(async () => {
        try {
            await markAllNotificationsAsViewed();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as viewed", error);
        }
    }, []);

    return (
        <AdminNotificationContext.Provider value={{ notifications, unreadCount, markAsViewed, markAllAsViewed }}>
            {children}
        </AdminNotificationContext.Provider>
    );
}

export function useAdminNotification() {
    const context = useContext(AdminNotificationContext);
    if (context === undefined) {
        throw new Error('useAdminNotification must be used within an AdminNotificationProvider');
    }
    return context;
}
