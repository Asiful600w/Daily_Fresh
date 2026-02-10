import { supabase } from './common';

export async function createOrder(
    userId: string,
    totalAmount: number,
    items: any[],
    shippingDetails: {
        name: string;
        phone: string;
        address: string;
    },
    paymentMethod: string = 'cod'
) {
    // 1. Create Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: userId,
            total_amount: totalAmount,
            status: 'pending',
            shipping_name: shippingDetails.name,
            shipping_phone: shippingDetails.phone,
            shipping_address: shippingDetails.address,

            payment_method: paymentMethod,
            payment_status: 'pending'
        })
        .select()
        .single();

    if (orderError) throw orderError;

    // 2. Create Order Items
    const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
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

    if (itemsError) throw itemsError;

    // 3. Clear Cart (Backend side)
    const { data: cart } = await supabase.from('carts').select('id').eq('user_id', userId).single();
    if (cart) {
        await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    }

    // 4. Update Stock Logic
    try {
        for (const item of items) {
            // Fetch latest stock to ensure accuracy
            const { data: product, error: fetchError } = await supabase
                .from('products')
                .select('stock_quantity')
                .eq('id', item.id)
                .single();

            if (product && !fetchError) {
                const newStock = Math.max(0, product.stock_quantity - item.quantity);
                await supabase
                    .from('products')
                    .update({ stock_quantity: newStock })
                    .eq('id', item.id);
            }
        }
    } catch (error) {
        console.error('Error updating stock:', error);
    }

    return order;
}

export async function getOrder(id: string) {
    console.log('getOrder called with id:', id);

    if (!id) return null;

    // 1. Fetch Order Metadata
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

    if (orderError) {
        console.error('Error fetching order metadata:', orderError);
        return null;
    }

    // 2. Fetch Order Items
    const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

    // 3. Fetch User Profile
    const { data: profile } = await supabase
        .from('User')
        .select('name, phone, image')
        .eq('id', order.user_id)
        .single();

    // 4. Assemble Result
    const customerName = profile?.name || order.shipping_name || 'Guest';
    const customerPhone = profile?.phone || order.shipping_phone || '';

    return {
        ...order,
        items: items || [],
        customer: {
            name: customerName,
            phone: customerPhone,
            avatar: profile?.image,
            id: order.user_id
        }
    };
}

export async function getUserOrders(userId: string) {
    console.log('getUserOrders called with userId:', userId);

    if (!userId) {
        console.error('getUserOrders called without userId');
        return [];
    }

    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items!order_items_order_id_fkey (id)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user orders:', error);
        return [];
    }

    return data.map((order: any) => ({
        ...order,
        item_count: order.order_items.length
    }));
}

export async function getAllOrders(searchQuery?: string) {
    let query = supabase
        .from('orders')
        .select(`
            *,
            order_items!order_items_order_id_fkey (id, name, quantity, size, color)
        `)
        .order('created_at', { ascending: false });

    if (searchQuery) {
        query = query.or(`id.ilike.%${searchQuery}%,shipping_name.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching all orders:', error);
        return [];
    }

    const userIds = Array.from(new Set((data || []).map((o: any) => o.user_id)));
    const { data: profiles } = await supabase
        .from('User')
        .select('id, name, phone, image')
        .in('id', userIds);

    return (data || []).map((order: any) => {
        const profile = profiles?.find((p: any) => p.id === order.user_id);
        const customerName = profile?.name || order.shipping_name || 'Guest';
        const customerPhone = profile?.phone || order.shipping_phone || '';

        return {
            ...order,
            item_count: order.order_items ? order.order_items.length : 0,
            items_summary: order.order_items ? order.order_items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ') : '',
            customer: {
                name: customerName,
                phone: customerPhone,
                avatar: profile?.image,
                id: order.user_id
            }
        };
    });
}

export async function updateOrderStatus(id: string, status: string) {
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

    if (error) throw error;
}

export async function getSalesAnalytics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .eq('status', 'delivered')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching sales analytics:', error);
        return [];
    }

    const salesMap = new Map<string, number>();

    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        salesMap.set(d.toLocaleDateString('en-US'), 0);
    }

    orders.forEach((order: any) => {
        const date = new Date(order.created_at).toLocaleDateString('en-US');
        const current = salesMap.get(date) || 0;
        salesMap.set(date, current + order.total_amount);
    });

    return Array.from(salesMap.entries())
        .map(([date, sales]) => ({ name: date.split('/')[0] + '/' + date.split('/')[1], sales, fullDate: date }))
        .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
}
