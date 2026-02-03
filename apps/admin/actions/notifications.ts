'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface OrderNotification {
    id: string;
    created_at: string;
    total_amount: number;
    shipping_name?: string;
    is_admin_viewed: boolean;
}

export async function getUnreadNotifications(): Promise<OrderNotification[]> {
    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('id, created_at, total_amount, shipping_name, is_admin_viewed')
        .eq('is_admin_viewed', false)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
    return data || [];
}

export async function markNotificationAsViewed(orderId: string) {
    const { error } = await supabaseAdmin
        .from('orders')
        .update({ is_admin_viewed: true })
        .eq('id', orderId);

    if (error) throw error;
}

export async function markAllNotificationsAsViewed() {
    const { error } = await supabaseAdmin
        .from('orders')
        .update({ is_admin_viewed: true })
        .eq('is_admin_viewed', false);

    if (error) throw error;
}
