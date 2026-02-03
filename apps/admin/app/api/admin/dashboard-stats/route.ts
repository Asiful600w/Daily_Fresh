import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabaseService';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const userId = searchParams.get('userId'); // Merchant ID if role is merchant

        const supabaseService = getSupabaseService();

        // --- SUPER ADMIN STATS ---
        if (role !== 'MERCHANT') {
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
            });
        }

        // --- MERCHANT STATS ---
        if (role === 'MERCHANT' && userId) {
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
            let totalEarnings = 0;
            let totalOrders = 0;
            let recentOrders: any[] = [];
            let salesChartData: any[] = []; // Data for chart

            if (productIds.length > 0) {
                // Fetch order items with order details
                const { data: orderItems, error: itemsError } = await supabaseService
                    .from('order_items')
                    .select(`
                        price, 
                        quantity, 
                        order_id,
                        name,
                        orders!inner (status, created_at)
                    `)
                    .in('product_id', productIds)
                    .neq('orders.status', 'cancelled')
                    .neq('orders.status', 'pending'); // Only count processed/delivered for earnings


                if (!itemsError && orderItems) {
                    const validItems = orderItems;

                    totalEarnings = validItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
                    totalOrders = new Set(validItems.map((i: any) => i.order_id)).size;

                    // --- GENERATE CHART DATA (Last 30 Days) ---
                    const salesMap = new Map<string, number>();

                    // Initialize last 30 days
                    for (let i = 29; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        salesMap.set(d.toLocaleDateString('en-US'), 0);
                    }

                    // Aggregate Valid Sales
                    validItems.forEach((item: any) => {
                        if (item.orders?.created_at) {
                            const date = new Date(item.orders.created_at).toLocaleDateString('en-US');
                            if (salesMap.has(date)) {
                                salesMap.set(date, salesMap.get(date)! + (item.price * item.quantity));
                            }
                        }
                    });

                    // Sort by date manually to ensure order (Map iteration order is usually insertion order but better safe)
                    salesChartData = Array.from(salesMap.entries())
                        .map(([date, sales]) => ({
                            name: date.split('/')[0] + '/' + date.split('/')[1], // MM/DD format
                            sales: sales,
                            fullDate: date
                        }))
                        .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());


                    // --- RECENT ORDERS ---
                    const processedOrderIds = new Set();
                    recentOrders = [...orderItems]
                        .sort((a: any, b: any) => new Date(b.orders.created_at).getTime() - new Date(a.orders.created_at).getTime())
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
                products: products,
                recentOrders,
                salesChartData
            });
        }

        return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });

    } catch (error: any) {
        console.error('Error in dashboard-stats API:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
