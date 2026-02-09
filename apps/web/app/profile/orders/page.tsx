import { createClient } from '@/lib/supabase/server';
import { getUserOrders } from '@/actions/orders';
import { redirect } from 'next/navigation';
import OrdersClient from './OrdersClient';

export default async function MyOrdersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    try {
        console.log('MyOrdersPage: Fetching orders for user', user.id);
        const orders = await getUserOrders(user.id);

        return <OrdersClient initialOrders={orders} />;
    } catch (error) {
        console.error('MyOrdersPage Error:', error);
        return <OrdersClient initialOrders={[]} />;
    }
}
