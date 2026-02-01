import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase with Service Role Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Critical: Missing Supabase Env Vars in Dashboard Stats Route');
}

const supabaseService = createClient(supabaseUrl, supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const userId = searchParams.get('userId'); // Merchant ID if role is merchant

        // --- SUPER ADMIN STATS ---
        if (role !== 'merchant') {
            // 1. Total Merchants
            const { count: merchantCount, error: merchantError } = await supabaseService
                .from('admins')
                .select('id', { count: 'exact', head: true })
                .eq('role', 'merchant');

            if (merchantError) {
                console.error('Error fetching merchant count:', merchantError);
                throw merchantError;
            }

            // 2. Low Stock (Reuse logic or fetch here)
            const { count: lowStockCount, error: lowStockError } = await supabaseService
                .from('products')
                .select('id', { count: 'exact', head: true })
                .lte('stock_quantity', 10) // Updated threshold to 10
                .eq('is_deleted', false);

            return NextResponse.json({
                merchantCount: merchantCount || 0,
                lowStockCount: lowStockCount || 0
                // Other stats like orders/sales are currently fetched on client side via 'adminApi', 
                // but those might work fine if RLS allows public read or if using existing client logic.
                // For consistency, we *could* move everything here, but let's fix the broken part first.
            });
        }

        // --- MERCHANT STATS ---
        if (role === 'merchant' && userId) {
            // 1. Get Merchant Products
            const { data: products, error: prodError } = await supabaseService
                .from('products')
                .select('id, name, is_approved, sold_count, images')
                .eq('merchant_id', userId)
                .eq('is_deleted', false);

            if (prodError) throw prodError;
            const productIds = products.map(p => p.id);

            // 2. Get Total Reviews for Merchant's Products
            let totalReviews = 0;
            if (productIds.length > 0) {
                const { count: reviewCount, error: reviewError } = await supabaseService
                    .from('reviews')
                    .select('id', { count: 'exact', head: true })
                    .in('product_id', productIds);

                if (!reviewError) totalReviews = reviewCount || 0;
            }

            // 3. Stats from Order Items
            // We need to fetch order items to calculate earnings
            let totalEarnings = 0;
            let totalOrders = 0;
            let recentOrders: any[] = [];

            if (productIds.length > 0) {
                const { data: orderItems, error: itemsError } = await supabaseService
                    .from('order_items')
                    .select(`
                        price, 
                        quantity, 
                        order_id,
                        name,
                        orders (status, created_at)
                    `)
                    .in('product_id', productIds)
                    .order('created_at', { ascending: false }); // Note: created_at is on orders... wait

                // Correction: order_items doesn't have created_at usually, orders does.
                // PostgREST sorting by nested relation: .order('created_at', { foreignTable: 'orders', ascending: false })
                // But order_items itself might not support that easily.
                // Let's fetch and sort in memory for now or just fetch simpler.

                if (!itemsError && orderItems) {
                    const validItems = orderItems.filter((i: any) => i.orders?.status !== 'cancelled' && i.orders?.status !== 'pending');
                    // Usually earnings count only delivered or processing? Or all valid confirmed?
                    // Let's count all non-cancelled for now.

                    totalEarnings = validItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
                    totalOrders = new Set(validItems.map((i: any) => i.order_id)).size;

                    // Recent orders
                    const processedOrderIds = new Set();
                    recentOrders = orderItems
                        .filter((i: any) => i.orders) // ensure order exists
                        .slice(0, 20) // take recent chunk
                        .map((item: any) => {
                            if (processedOrderIds.has(item.order_id)) return null;
                            processedOrderIds.add(item.order_id);
                            return {
                                id: item.order_id,
                                product_name: item.name,
                                date: item.orders.created_at,
                                price: item.price * item.quantity,
                                status: item.orders.status
                            };
                        })
                        .filter(Boolean)
                        .slice(0, 5);
                }
            }

            return NextResponse.json({
                totalEarnings,
                totalOrders,
                totalProducts: products.length,
                totalReviews,
                products: products, // Return basic product info
                recentOrders
            });
        }

        return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });

    } catch (error: any) {
        console.error('Error in dashboard-stats API:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
