import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import WishlistClient from './WishlistClient';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    try {
        console.log('WishlistPage: Fetching for user', user.id);

        // 1. Fetch Wishlist IDs
        const { data: wishlistData, error: wishlistError } = await supabase
            .from('wishlists')
            .select('id, product_id, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (wishlistError) {
            console.error('WishlistPage Error fetching IDs:', wishlistError);
            throw wishlistError;
        }

        const ids = wishlistData?.map(w => w.product_id) || [];

        if (ids.length === 0) {
            return <WishlistClient initialItems={[]} />;
        }

        // 2. Fetch Products
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .in('id', ids);

        if (productsError) {
            console.error('WishlistPage Error fetching products:', productsError);
            throw productsError;
        }

        // 3. Map items
        const items = wishlistData!.map(w => {
            const product = products?.find(p => p.id === w.product_id);
            return {
                id: w.id,
                product: product ? { ...product, image: product.image_url } : null
            };
        }).filter(item => item.product);

        return <WishlistClient initialItems={items} />;

    } catch (error) {
        console.error('WishlistPage loading error:', error);
        return <WishlistClient initialItems={[]} />;
    }
}
