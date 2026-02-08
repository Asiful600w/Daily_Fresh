'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    getAdminOrders,
    getSalesAnalytics,
    getCategoryStats,
    getBestSellingProducts,
} from '@/lib/adminApi';
import { formatPrice } from '@/lib/format';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboard() {
    const { adminUser, adminLoading } = useAdminAuth();

    // Super Admin State
    const [orders, setOrders] = useState<any[]>([]);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [categoryStats, setCategoryStats] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [merchantCount, setMerchantCount] = useState(0);

    // Merchant State
    const [merchantStats, setMerchantStats] = useState<any>(null);

    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (adminUser?.role === 'MERCHANT') {
                // Fetch from secure API
                const res = await fetch(`/api/admin/dashboard-stats?role=merchant&userId=${adminUser.id}`);
                const stats = await res.json();
                if (res.ok) {
                    setMerchantStats(stats);
                } else {
                    console.error('Failed to fetch merchant stats:', stats.error);
                }
            } else {
                // Super Admin
                // 1. Fetch secure stats (Merchant Count, etc)
                const secureRes = await fetch('/api/admin/dashboard-stats?role=admin');
                const secureData = await secureRes.json();

                if (secureRes.ok) {
                    setMerchantCount(secureData.merchantCount || 0);
                    setLowStockCount(secureData.lowStockCount || 0);
                }

                // 2. Fetch standard stats (Orders, Products)
                const [ordersData, analyticsData, catStats, topProdData] = await Promise.all([
                    getAdminOrders(),
                    getSalesAnalytics(),
                    getCategoryStats(),
                    getBestSellingProducts(10)
                ]);

                setOrders(ordersData);
                // setLowStockCount is handled by secure API
                setSalesData(analyticsData);
                setCategoryStats(catStats);
                setTopProducts(topProdData);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    }, [adminUser]);

    useEffect(() => {
        if (!adminLoading && adminUser) {
            fetchData();
        }
    }, [adminUser, adminLoading, fetchData]);

    // Set up Realtime subscription for orders (Super Admin only)
    useEffect(() => {
        if (adminUser?.role !== 'SUPERADMIN') return;

        const supabase = createClient();

        const channel = supabase
            .channel('dashboard-orders-realtime')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload: any) => {
                    console.log('Dashboard: New order received', payload.new);
                    // Prepend new order to the list
                    setOrders(prev => [payload.new, ...prev]);
                }
            )
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                (payload: any) => {
                    console.log('Dashboard: Order updated', payload.new);
                    // Update order in the list
                    setOrders(prev => prev.map(order =>
                        order.id === payload.new.id ? payload.new : order
                    ));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [adminUser]);

    if (adminLoading || loading) {
        return <div className="p-8 text-center">Loading Dashboard...</div>;
    }

    if (adminUser?.role === 'MERCHANT') {
        const { totalEarnings, totalOrders, totalProducts, recentOrders, products, totalReviews, salesChartData } = merchantStats || {};

        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Merchant Dashboard</h1>
                    <div className="flex items-center gap-2">
                        <span className="flex h-3 w-3 rounded-full bg-green-500"></span>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Shop Open</span>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <span className="text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-lg">+18.2%</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Earnings</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{formatPrice(totalEarnings || 0)}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                <span className="material-symbols-outlined">check_circle</span>
                            </div>
                            <span className="text-xs font-bold text-blue-700 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-lg">+4.3%</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Successful Orders</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalOrders || 0}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                                <span className="material-symbols-outlined">inventory_2</span>
                            </div>
                            <span className="text-xs font-bold text-purple-700 bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-lg">New: {products?.filter((p: any) => !p.is_approved).length || 0}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Products</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalProducts || 0}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-yellow-600 dark:text-yellow-400">
                                <span className="material-symbols-outlined">star</span>
                            </div>
                            <span className="text-xs font-bold text-yellow-700 bg-yellow-100 dark:bg-yellow-900/40 px-2 py-1 rounded-lg">Dynamic</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Reviews</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalReviews || 0}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Growth Chart (Mock for now, reused container) */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Growth</h3>
                                <p className="text-sm text-slate-500">Weekly earnings performance</p>
                            </div>
                        </div>
                        <div className="h-72 w-full mt-4">
                            {salesChartData && salesChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesChartData}>
                                        <defs>
                                            <linearGradient id="colorMerchantSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 10, fill: '#64748B' }}
                                            tickLine={false}
                                            axisLine={false}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10, fill: '#64748B' }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => formatPrice(value)}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', borderColor: '#e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: any) => [formatPrice(value), 'Earnings']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="sales"
                                            stroke="#22C55E"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorMerchantSales)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                    No sales data available for chart.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Selling Items */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Top Selling Items</h3>
                        <div className="space-y-6">
                            {(products || []).slice(0, 3).map((product: any) => (
                                <div key={product.id} className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                                        {/* If image exists show it, else icon */}
                                        <span className="material-symbols-outlined text-slate-400">shopping_bag</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{product.name}</p>
                                        <p className="text-xs text-slate-500">{product.sold_count || 0} Sales this month</p>
                                    </div>
                                </div>
                            ))}
                            {(!products || products.length === 0) && <p className="text-sm text-slate-500">No products yet.</p>}
                        </div>
                        <Link href="/admin/products" className="block w-full mt-8 py-3 text-center border border-green-500 text-green-500 font-bold text-sm rounded-xl hover:bg-green-50 transition-colors uppercase tracking-wide">
                            Manage All Products
                        </Link>
                    </div>
                </div>

                {/* Recent Item Orders */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Item Orders</h3>
                        <Link href="/admin/orders" className="text-green-500 font-bold text-sm hover:underline">View All My Sales</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {(recentOrders || []).map((order: any) => (
                                    <tr key={order.id + order.product_name} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">#{String(order.id).padStart(8, '0')}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-slate-400 text-lg">inventory_2</span>
                                                <span className="line-clamp-1">{order.product_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400 font-medium">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{formatPrice(order.price)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-400 hover:text-green-500 transition-colors">
                                                <span className="material-symbols-outlined">more_horiz</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!recentOrders || recentOrders.length === 0) && (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No orders yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- SUPER ADMIN DASHBOARD (Existing) ---

    // Calculate Stats
    const totalSales = orders.reduce((sum, order) => sum + (order.status?.toUpperCase() === 'DELIVERED' ? Number(order.total_amount) : 0), 0);
    const processingOrders = orders.filter(o => o.status?.toUpperCase() === 'PROCESSING').length;
    const pendingOrders = orders.filter(o => o.status?.toUpperCase() === 'PENDING').length;
    const deliveredOrders = orders.filter(o => o.status?.toUpperCase() === 'DELIVERED').length;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'text-yellow-700 bg-yellow-100';
            case 'processing': return 'text-blue-700 bg-blue-100';
            case 'delivered': return 'text-green-700 bg-green-100';
            case 'cancelled': return 'text-red-700 bg-red-100';
            default: return 'text-gray-700 bg-gray-100';
        }
    };

    const getStatusDot = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-600';
            case 'processing': return 'bg-blue-600';
            case 'delivered': return 'bg-green-600';
            case 'cancelled': return 'bg-red-600';
            default: return 'bg-gray-600';
        }
    };

    return (
        <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-background-dark p-4 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-1 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">+12.5%</span>
                    </div>
                    <p className="text-text-muted text-sm font-medium">Total Sales</p>
                    <p className="text-2xl font-bold text-text-main">{formatPrice(totalSales)}</p>
                </div>

                {/* Active (Processing) Orders */}
                <div className="bg-white dark:bg-background-dark p-4 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-1 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <span className="material-symbols-outlined">sync</span>
                        </div>
                    </div>
                    <p className="text-text-muted text-sm font-medium">Active (Processing)</p>
                    <p className="text-2xl font-bold text-text-main">{processingOrders}</p>
                </div>

                {/* Pending Orders */}
                <div className="bg-white dark:bg-background-dark p-4 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-1 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                            <span className="material-symbols-outlined">hourglass_empty</span>
                        </div>
                    </div>
                    <p className="text-text-muted text-sm font-medium">Pending Orders</p>
                    <p className="text-2xl font-bold text-text-main">{pendingOrders}</p>
                </div>

                {/* Completed (Delivered) Orders */}
                <div className="bg-white dark:bg-background-dark p-4 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-1 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                            <span className="material-symbols-outlined">check_circle</span>
                        </div>
                    </div>
                    <p className="text-text-muted text-sm font-medium">Order Completed</p>
                    <p className="text-2xl font-bold text-text-main">{deliveredOrders}</p>
                </div>

                {/* Low Stock Alerts */}
                <Link href="/admin/low-stock" className="bg-white dark:bg-background-dark p-4 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-1 ring-1 ring-red-100 transition-all hover:shadow-md hover:ring-red-200 cursor-pointer block">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                            <span className="material-symbols-outlined">warning</span>
                        </div>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Critical</span>
                    </div>
                    <p className="text-text-muted text-sm font-medium">Low Stock Alerts</p>
                    <p className="text-2xl font-bold text-red-600">{lowStockCount} Items</p>
                </Link>

                {/* Total Merchants */}
                <div className="bg-white dark:bg-background-dark p-4 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-1 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <span className="material-symbols-outlined">store</span>
                        </div>
                    </div>
                    <p className="text-text-muted text-sm font-medium">Total Merchants</p>
                    <p className="text-2xl font-bold text-text-main">{merchantCount}</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-background-dark rounded-2xl border border-border-subtle p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-text-main">Sales Overview</h3>
                            <p className="text-sm text-text-muted">Last 30 days performance</p>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fill: '#64748B' }}
                                    tickLine={false}
                                    axisLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: '#64748B' }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => formatPrice(value)}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', borderColor: '#e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [formatPrice(value), 'Sales']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#22C55E"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Popular Categories */}
                <div className="bg-white dark:bg-background-dark rounded-2xl border border-border-subtle p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-text-main mb-6">Popular Categories</h3>
                    <div className="space-y-4">
                        {categoryStats.length === 0 ? (
                            <p className="text-sm text-text-muted">No sales data available yet.</p>
                        ) : (
                            categoryStats.slice(0, 5).map((cat, index) => {
                                const colors = ['bg-primary', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                                const color = colors[index % colors.length];

                                return (
                                    <div key={cat.name} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-text-main">{cat.name}</span>
                                            <span className="font-bold text-text-main">{cat.percentage}%</span>
                                        </div>
                                        <div className={`h-2 w-full rounded-full overflow-hidden relative bg-gray-100 dark:bg-gray-700`}>
                                            <div
                                                className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
                                                style={{ width: `${cat.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <button className="w-full mt-6 py-2 rounded-lg border border-primary text-primary text-xs font-bold hover:bg-primary/5 transition-colors uppercase tracking-wider">
                        View Full Report
                    </button>
                </div>
            </div>

            {/* Top Products Chart */}
            <div className="bg-white dark:bg-background-dark rounded-2xl border border-border-subtle p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-text-main">Top Selling Products</h3>
                        <p className="text-sm text-text-muted">Best performing items by quantity sold</p>
                    </div>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={150}
                                tick={{ fontSize: 11, fill: '#64748B' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '12px', borderColor: '#e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [value, 'Sold Count']}
                            />
                            <Bar dataKey="sold_count" fill="#22C55E" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white dark:bg-background-dark rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                    <h3 className="text-lg font-bold text-text-main">Recent Orders</h3>
                    <Link href="/admin/orders" className="text-primary text-sm font-bold hover:underline">View All Orders</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-primary/5 text-text-muted text-[11px] uppercase tracking-wider font-bold">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-text-muted">Loading...</td>
                                </tr>
                            ) : (
                                orders.slice(0, 5).map((order) => (
                                    <tr key={order.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-6 py-4 text-sm font-bold text-text-main">#{String(order.id).padStart(8, '0')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-text-main">{order.shipping_name || 'Guest'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-text-main">{formatPrice(order.total_amount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                <span className={`w-1 h-1 rounded-full ${getStatusDot(order.status)}`}></span> {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href="/admin/orders" className="material-symbols-outlined text-text-muted hover:text-primary transition-colors">edit_square</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
