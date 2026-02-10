import { createClient } from '@/lib/supabase/server';
import { getUserStats, getRecentOrders } from '@/actions/orders';
import ProfileClient from './ProfileClient';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    try {
        console.log('ProfilePage: Fetching data for user', user.id);
        const [stats, recentOrders] = await Promise.all([
            getUserStats(user.id),
            getRecentOrders(user.id)
        ]);

        console.log('ProfilePage: Data fetched', { stats, recentOrders: recentOrders?.length });

        return (
            <ProfileClient
                initialStats={stats}
                initialOrders={recentOrders}
            />
        );
    } catch (error: any) {
        console.error('ProfilePage Error:', error);
        return (
            <ProfileClient
                initialStats={null}
                initialOrders={[]}
                error={error.message || 'Failed to load profile data'}
            />
        );
    }
}
