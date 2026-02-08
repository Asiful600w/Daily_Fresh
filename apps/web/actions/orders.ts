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
                order_items (
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

/**
 * Get single order details
 */
export async function getOrderDetails(orderId: number) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
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
