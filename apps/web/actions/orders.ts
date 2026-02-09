'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface OrderItem {
    id: string | number;
    name: string;
    price: number;
    quantity: number;
    images?: string[];
    image?: string;
    category?: string;
    size?: string;
    color?: string;
}

export interface ShippingDetails {
    name: string;
    phone: string;
    address: string;
}

/**
 * Create a new order with order items
 */
export async function createOrderAction(
    userId: string,
    totalAmount: number,
    items: OrderItem[],
    shippingDetails: ShippingDetails,
    paymentMethod: string = 'cod'
): Promise<{ success: boolean; orderId?: number; error?: string }> {
    try {
        const supabase = await createClient();

        console.log('Creating order for user:', userId);
        console.log('Total amount:', totalAmount);
        console.log('Items count:', items.length);
        console.log('Shipping:', shippingDetails);

        // 1. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                total_amount: totalAmount,
                status: 'PENDING',
                shipping_name: shippingDetails.name,
                shipping_phone: shippingDetails.phone,
                shipping_address: shippingDetails.address,
                payment_method: paymentMethod,
                payment_status: 'pending'
            })
            .select()
            .single();

        if (orderError) {
            console.error('Order creation error:', orderError);
            throw orderError;
        }

        console.log('Order created:', order.id);

        // 2. Create Order Items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: Number(item.id),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.images && item.images.length > 0 ? item.images[0] : (item.image || ''),
            category: item.category,
            size: item.size,
            color: item.color
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Order items error:', itemsError);
            throw itemsError;
        }

        console.log('Order items created:', orderItems.length);

        // 3. Update Stock
        try {
            for (const item of items) {
                const { data: product } = await supabase
                    .from('products')
                    .select('stock_quantity')
                    .eq('id', item.id)
                    .single();

                if (product) {
                    const newStock = Math.max(0, product.stock_quantity - item.quantity);
                    await supabase
                        .from('products')
                        .update({ stock_quantity: newStock })
                        .eq('id', item.id);
                }
            }
        } catch (error) {
            console.error('Stock update error:', error);
            // Don't fail the order if stock update fails
        }

        revalidatePath('/orders');
        revalidatePath('/admin/orders');

        return { success: true, orderId: order.id };

    } catch (error: any) {
        console.error('createOrderAction Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create order'
        };
    }
}

/**
 * Get user's orders
 */
export async function getUserOrders(userId: string) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items!fk_order_items_order (
                    *
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user orders:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Exception fetching user orders:', error);
        return [];
    }
}

export async function getUserStats(userId: string) {
    try {
        console.log('getUserStats: Starting for userId:', userId);
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('getUserStats: No authenticated user (server-side):', authError);
        } else {
            console.log('getUserStats: Authenticated user:', user.id);
        }

        // Use count queries for better performance
        // We can run these in parallel
        const [processing, pending, delivered, totalSpentReq, savedItems] = await Promise.all([
            // Use Uppercase for status to match DB
            supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', userId).in('status', ['PROCESSING', 'ON_DELIVERY']),
            supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'PENDING'),
            supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'DELIVERED'),
            supabase.from('orders').select('total_amount').eq('user_id', userId).eq('status', 'DELIVERED'),
            supabase.from('wishlists').select('id', { count: 'exact', head: true }).eq('user_id', userId)
        ]);

        const totalSpent = totalSpentReq.data?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;

        return {
            activeOrders: processing.count || 0,
            pendingOrders: pending.count || 0,
            completedOrders: delivered.count || 0,
            totalSpent,
            savedItems: savedItems.count || 0
        };
    } catch (error: any) {
        console.error('Error fetching user stats:', error);
        console.error('Stats Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return { activeOrders: 0, pendingOrders: 0, completedOrders: 0, totalSpent: 0 };
    }
}

export async function getRecentOrders(userId: string, limit: number = 5) {
    try {
        console.log('getRecentOrders: Starting for userId:', userId);
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('getRecentOrders: No authenticated user (server-side):', authError);
        } else {
            console.log('getRecentOrders: Authenticated user:', user.id);
        }

        // Fetch strictly what is needed for the list
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                total_amount,
                status,
                payment_status,
                order_items!fk_order_items_order (
                    name,
                    image,
                    quantity
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('getRecentOrders Supabase Error:', JSON.stringify(error, null, 2));
            throw error;
        }

        console.log('getRecentOrders: Request Successful. Rows:', data ? data.length : 0);
        return data || [];
    } catch (error: any) {
        console.error('Error fetching recent orders:', error);
        console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return [];
    }
}

/**
 * Get single order details
 */
export async function getOrderDetails(orderId: number | string) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items!fk_order_items_order (
                    *
                )
            `)
            .eq('id', orderId)
            .single();

        if (error) {
            console.error('Error fetching order details:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Exception fetching order details:', error);
        return null;
    }
}
