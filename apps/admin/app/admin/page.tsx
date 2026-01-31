'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminOrders, updateAdminOrderStatus, getLowStockProducts, getSalesAnalytics, getCategoryStats, getBestSellingProducts } from '@/lib/adminApi';
import { formatPrice } from '@/lib/format';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [categoryStats, setCategoryStats] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ordersData, lowStockData, analyticsData, catStats, topProdData] = await Promise.all([
                getAdminOrders(),
                getLowStockProducts(),
                getSalesAnalytics(),
                getCategoryStats(),
                getBestSellingProducts(10)
            ]);
            setOrders(ordersData);
            setLowStockCount(lowStockData.length);
            setSalesData(analyticsData);
            setCategoryStats(catStats);
            setTopProducts(topProdData);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Stats
    const totalSales = orders.reduce((sum, order) => sum + (order.status === 'delivered' ? order.total_amount : 0), 0);
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

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

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateAdminOrderStatus(id, newStatus);
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error('Failed to update status', error);
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
                                const bgColor = color.replace('bg-', 'bg-') + '/10'; // Approximation for bg-opacity
                                // Tailwind arbitrary values for opacity logic might be complex string manip, 
                                // simpler to use style or known utility. 
                                // Let's use `bg-${name}-500` pattern if possible or just the array.
                                // Actually, for the background bar, raw CSS or specific opacity utility class.

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
                                        <td className="px-6 py-4 text-sm font-bold text-text-main">#{order.id.slice(0, 8)}</td>
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
