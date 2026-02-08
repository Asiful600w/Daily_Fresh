import { createClient } from '@/lib/supabase/server';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import { AdminUser } from '@/context/AdminAuthContext';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    let initialUser: AdminUser | null = null;

    if (user) {
        // Fetch profile to get role and details
        // We do this server side so we can pass complete object to client
        const { data: profile } = await supabase
            .from('User')
            .select('role, name, shopName, id, email')
            .eq('id', user.id)
            .single();

        if (profile) {
            initialUser = {
                id: user.id,
                email: user.email,
                role: profile.role as 'SUPERADMIN' | 'MERCHANT' | 'CUSTOMER',
                full_name: profile.name,
                shop_name: profile.shopName,
                image: user.user_metadata?.avatar_url
            };
        }
    }

    return (
        <AdminLayoutShell initialUser={initialUser}>
            {children}
        </AdminLayoutShell>
    );
}
