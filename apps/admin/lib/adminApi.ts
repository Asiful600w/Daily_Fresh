import { supabaseAdmin } from './supabaseAdmin';

export async function getAdminOrders(searchQuery?: string) {
    let query = supabaseAdmin
        .from('orders')
        .select(`
            *,
            order_items (id, name, quantity, size, color)
        `)
        .order('created_at', { ascending: false });

    if (searchQuery) {
        query = query.or(`id.ilike.%${searchQuery}%,shipping_name.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching admin orders:', error);
        return [];
    }

    // Fetch profiles for these users to show dynamic names
    // Note: We use supabaseAdmin for this too, assuming admins can read profiles
    const userIds = Array.from(new Set((data || []).map(o => o.user_id)));
    const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, phone, avatar_url')
        .in('id', userIds);

    return (data || []).map(order => {
        const profile = profiles?.find(p => p.id === order.user_id);
        const customerName = profile?.full_name || order.shipping_name || 'Guest';
        const customerPhone = profile?.phone || order.shipping_phone || '';

        return {
            ...order,
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
