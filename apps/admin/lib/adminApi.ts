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
