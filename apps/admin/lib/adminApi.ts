import { supabaseAdmin } from './supabaseAdmin';

export async function getAdminOrders(searchQuery?: string, merchantId?: string) {
    let orderIds: string[] | null = null;

    // 1. If Merchant, define scope first
    if (merchantId) {
        // Get Merchant Products
        const { data: products } = await supabaseAdmin
            .from('products')
            .select('id')
            .eq('merchant_id', merchantId);

        const productIds = products ? products.map(p => p.id) : [];

        if (productIds.length === 0) return [];

        // Get Orders containing these products
        const { data: items } = await supabaseAdmin
            .from('order_items')
            .select('order_id')
            .in('product_id', productIds);

        orderIds = items ? Array.from(new Set(items.map(i => i.order_id))) : [];
        if (orderIds.length === 0) return [];
    }

    let query = supabaseAdmin
        .from('orders')
        .select(`
            *,
            order_items (
                id, name, quantity, size, color, product_id, price
            )
        `)
        .order('created_at', { ascending: false });

    if (orderIds) {
        query = query.in('id', orderIds);
    }

    if (searchQuery) {
        query = query.or(`id.ilike.%${searchQuery}%,shipping_name.ilike.%${searchQuery}%`);
    }

    const { data: ordersData, error } = await query;

    if (error) {
        console.error('Error fetching admin orders:', error);
        return [];
    }

    // 2. Additional Filter: For merchants, we must HIDE items that aren't theirs.
    // We need to fetch the merchant's product list again (or cache it) to verify items.
    // Or we can assume if we passed merchantId, we interpret 'order_items' differently.

    // Optimisation: We already have productIds if merchantId is set, but it was local scope.
    // Let's refetch or just filter properly? 
    // Actually, 'order_items' in the response contains ALL items for that order.
    // We should filter this list before returning to frontend.

    let processedOrders = ordersData || [];

    if (merchantId) {
        // We need to know which products are ours to filter the items list.
        const { data: products } = await supabaseAdmin
            .from('products')
            .select('id')
            .eq('merchant_id', merchantId);
        const myProductIds = new Set(products?.map(p => p.id) || []);

        processedOrders = processedOrders.map(order => ({
            ...order,
            order_items: order.order_items.filter((item: any) => myProductIds.has(item.product_id)),
            // Optional: Recalculate total_amount for display? 
            // Only if we want to show "Merchant Total" instead of "Order Total"
            // For now, let's keep Order Total but maybe add a 'merchant_total' field?
            merchant_total: order.order_items
                .filter((item: any) => myProductIds.has(item.product_id))
                .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
        }));
    }

    // Fetch profiles for these users to show dynamic names
    const userIds = Array.from(new Set(processedOrders.map(o => o.user_id)));
    const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, phone, avatar_url')
        .in('id', userIds);

    return processedOrders.map(order => {
        const profile = profiles?.find(p => p.id === order.user_id);
        const customerName = profile?.full_name || order.shipping_name || 'Guest';
        const customerPhone = profile?.phone || order.shipping_phone || '';

        // If merchant, use merchant_total, else total_amount
        const displayTotal = (order as any).merchant_total !== undefined ? (order as any).merchant_total : order.total_amount;

        return {
            ...order,
            total_amount: displayTotal, // Override for display
            item_count: order.order_items ? order.order_items.length : 0,
            items_summary: order.order_items ? order.order_items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ') : '',
            customer: {
                name: customerName,
                phone: customerPhone,
                avatar: profile?.avatar_url,
                id: order.user_id
            }
        };
    });
}

export async function updateAdminOrderStatus(id: string, status: string) {
    const { error } = await supabaseAdmin
        .from('orders')
        .update({ status })
        .eq('id', id);

    if (error) throw error;
}

export async function getAdminOrder(id: string) {
    const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select(`
            *,
            items:order_items(
                *,
                products (images)
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching admin order:', error);
        return null;
    }

    // Fetch profile for dynamic customer info
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('id', order.user_id)
        .single();

    const customerName = profile?.full_name || order.shipping_name || 'Guest';
    const customerPhone = profile?.phone || order.shipping_phone || '';

    return {
        ...order,
        customer: {
            name: customerName,
            phone: customerPhone,
            avatar: profile?.avatar_url,
            id: order.user_id
        }
    };
}

export async function getLowStockProducts() {
    const { data, error } = await supabaseAdmin
        .from('products')
        .select('id, name, stock_quantity')
        .lte('stock_quantity', 5)
        .eq('is_deleted', false);

    if (error) {
        console.error('Error fetching low stock products:', error);
        return [];
    }
    return data;
}

export async function getBestSellingProducts(limit: number = 8) {
    const { data, error } = await supabaseAdmin
        .from('products')
        .select(`
            *,
            categories (name),
            special_categories (name)
        `)
        .eq('is_deleted', false)
        .order('sold_count', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching best selling products:', error);
        return [];
    }
    return data;
}

export async function getSalesAnalytics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: orders, error } = await supabaseAdmin
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

    orders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-US');
        const current = salesMap.get(date) || 0;
        salesMap.set(date, current + order.total_amount);
    });

    return Array.from(salesMap.entries())
        .map(([date, sales]) => ({ name: date.split('/')[0] + '/' + date.split('/')[1], sales, fullDate: date }))
        .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
}

export async function getCategoryStats() {
    try {
        const { data: viewData, error: viewError } = await supabaseAdmin
            .from('category_stats')
            .select('*')
            .order('total_items_sold', { ascending: false });

        if (!viewError && viewData) {
            const total = viewData.reduce((sum, item) => sum + item.total_items_sold, 0);
            return viewData.map((item: any) => ({
                name: item.category,
                count: item.total_items_sold,
                percentage: total > 0 ? Math.round((item.total_items_sold / total) * 100) : 0
            }));
        }

        const { data, error } = await supabaseAdmin
            .from('order_items')
            .select('category, quantity');

        if (error) throw error;

        const stats = new Map<string, number>();
        let totalItems = 0;

        data.forEach((item: any) => {
            if (item.category) {
                const current = stats.get(item.category) || 0;
                stats.set(item.category, current + item.quantity);
                totalItems += item.quantity;
            }
        });

        return Array.from(stats.entries())
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count);

    } catch (error) {
        console.error('Error fetching category stats:', error);
        return [];
    }
}

export async function getMerchantStats(merchantId: string) {
    // 1. Get Merchant Products
    const { data: products, error: prodError } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('is_deleted', false);

    if (prodError) {
        console.error('Error fetching merchant products:', prodError);
        return { totalEarnings: 0, totalOrders: 0, totalProducts: 0, products: [], recentOrders: [] };
    }

    const productIds = products.map(p => p.id);

    // 2. Get Order Items for these products
    // Note: We need to filter order_items manually or via IN query
    const { data: orderItems, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select(`
            *,
            orders (id, created_at, status, shipping_name)
        `)
        .in('product_id', productIds)
        .order('created_at', { ascending: false });

    if (itemsError) {
        console.error('Error fetching merchant order items:', itemsError);
        return { totalEarnings: 0, totalOrders: 0, totalProducts: products.length, products, recentOrders: [] };
    }

    // 3. Calculate Stats
    const validItems = orderItems.filter((i: any) => i.orders?.status !== 'cancelled');
    const totalEarnings = validItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const totalOrders = new Set(validItems.map((i: any) => i.order_id)).size;

    // 4. Get Total Reviews for Merchant's Products
    const { count: totalReviews, error: reviewError } = await supabaseAdmin
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .in('product_id', productIds);

    // 5. Recent Orders
    const recentOrderIds = Array.from(new Set(orderItems.map((i: any) => i.order_id))).slice(0, 5);
    const recentOrders = recentOrderIds.map(orderId => {
        const item = orderItems.find((i: any) => i.order_id === orderId);
        return {
            id: orderId,
            product_name: item.name + (orderItems.filter((i: any) => i.order_id === orderId).length > 1 ? ` (+${orderItems.filter((i: any) => i.order_id === orderId).length - 1} others)` : ''),
            date: item.orders?.created_at,
            price: item.price * item.quantity,
            status: item.orders?.status
        };
    });

    return {
        totalEarnings,
        totalOrders,
        totalProducts: products.length,
        totalReviews: totalReviews || 0,
        products,
        recentOrders
    };
}

export async function getTotalMerchantsCount() {
    const { count, error } = await supabaseAdmin
        .from('admins')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'merchant');

    if (error) {
        console.error('Error fetching merchant count:', JSON.stringify(error, null, 2));
        return 0;
    }
    return count || 0;
}
