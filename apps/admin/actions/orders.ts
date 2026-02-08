'use server'

import { getSupabaseService } from '@/lib/supabaseService';
import { revalidatePath } from 'next/cache';

export interface AdminOrder {
    id: number;
    user_id: string;
    total_amount: number;
    status: string;
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    payment_method: string;
    payment_status: string;
    created_at: string;
    updated_at: string;
    User?: {
        name: string;
        email: string;
    };
    order_items?: OrderItem[];
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    category?: string;
    size?: string;
    color?: string;
}

export interface OrderFilters {
    status?: string;
    searchTerm?: string;
}

/**
 * Get all orders with optional filters (Admin only)
 */
export async function getAllOrders(filters?: OrderFilters): Promise<AdminOrder[]> {
    try {
        const supabase = getSupabaseService();

        let query = supabase
            .from('orders')
            .select(`
                *,
                User!fk_orders_user (
                    name,
                    email
                ),
                order_items!order_items_order_id_fkey (
                    *
                )
            `)
            .order('created_at', { ascending: false });

        // Apply status filter
        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching all orders:', error);
            return [];
        }

        // Apply search filter in memory
        let results = data || [];
        if (filters?.searchTerm && results.length > 0) {
            const term = filters.searchTerm.toLowerCase();
            results = results.filter(order =>
                order.shipping_name?.toLowerCase().includes(term) ||
                order.shipping_phone?.includes(term) ||
                order.User?.name?.toLowerCase().includes(term) ||
                order.User?.email?.toLowerCase().includes(term) ||
                order.id.toString().includes(term)
            );
        }

        return results;
    } catch (error) {
        console.error('Exception fetching all orders:', error);
        return [];
    }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
    orderId: number,
    status: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = getSupabaseService();

        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order status:', error);
            return { success: false, error: 'Failed to update order status.' };
        }

        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error: any) {
        console.error('Exception updating order status:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}

/**
 * Get order statistics for admin dashboard
 */
export async function getOrderStatistics(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
}> {
    try {
        const supabase = getSupabaseService();

        const { data: allOrders } = await supabase
            .from('orders')
            .select('status, total_amount');

        if (!allOrders) {
            return {
                totalOrders: 0,
                pendingOrders: 0,
                processingOrders: 0,
                deliveredOrders: 0,
                totalRevenue: 0
            };
        }

        const totalOrders = allOrders.length;
        const pendingOrders = allOrders.filter(o => o.status === 'PENDING').length;
        const processingOrders = allOrders.filter(o => o.status === 'PROCESSING').length;
        const deliveredOrders = allOrders.filter(o => o.status === 'DELIVERED').length;
        const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

        return {
            totalOrders,
            pendingOrders,
            processingOrders,
            deliveredOrders,
            totalRevenue
        };
    } catch (error) {
        console.error('Exception fetching order statistics:', error);
        return {
            totalOrders: 0,
            pendingOrders: 0,
            processingOrders: 0,
            deliveredOrders: 0,
            totalRevenue: 0
        };
    }
}
