'use client';

import { useState, useEffect } from 'react';
import {
    getAllOrders,
    updateOrderStatus,
    getOrderStatistics,
    type AdminOrder,
    type OrderFilters
} from '@/actions/orders';
import { formatPrice } from '@/lib/format';
import { createClient } from '@/lib/supabase/client';

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    PROCESSING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    SHIPPED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    DELIVERED: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        deliveredOrders: 0,
        totalRevenue: 0
    });
    const [filters, setFilters] = useState<OrderFilters>({ status: 'all' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

    const loadData = async () => {
        setLoading(true);
        const [ordersData, statsData] = await Promise.all([
            getAllOrders({ ...filters, searchTerm }),
            getOrderStatistics()
        ]);
        setOrders(ordersData);
        setStats(statsData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [filters]);

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.success) {
            loadData();
        } else {
            alert(result.error);
        }
    };

    const handleSearch = () => {
        setFilters({ ...filters, searchTerm });
    };

    // Set up Realtime subscription for orders
    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel('orders-page-realtime')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload: any) => {
                    console.log('Orders Page: New order received', payload.new);
                    // Prepend new order to the list
                    setOrders(prev => [payload.new, ...prev]);
                    // Update stats
                    setStats(prev => ({
                        ...prev,
                        totalOrders: prev.totalOrders + 1,
                        pendingOrders: prev.pendingOrders + (payload.new.status?.toLowerCase() === 'pending' ? 1 : 0)
                    }));
                }
            )
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                (payload: any) => {
                    console.log('Orders Page: Order updated', payload.new);
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
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Orders Management</h1>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Orders</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalOrders}</p>
                        </div>
                        <span className="material-icons-round text-3xl text-blue-500">shopping_bag</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingOrders}</p>
                        </div>
                        <span className="material-icons-round text-3xl text-yellow-500">schedule</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Processing</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.processingOrders}</p>
                        </div>
                        <span className="material-icons-round text-3xl text-blue-500">sync</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Delivered</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.deliveredOrders}</p>
                        </div>
                        <span className="material-icons-round text-3xl text-green-500">check_circle</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Revenue</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatPrice(stats.totalRevenue)}</p>
                        </div>
                        <span className="material-icons-round text-3xl text-green-500">payments</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Search</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Order ID, customer name, phone..."
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                            />
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <select
                            value={filters.status || 'all'}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                        >
                            <option value="all">All Statuses</option>
                            {ORDER_STATUSES.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">&nbsp;</label>
                        <button
                            onClick={() => {
                                setFilters({ status: 'all' });
                                setSearchTerm('');
                            }}
                            className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No orders found
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {orders.map((order) => (
                            <div key={order.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between gap-4 group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="min-w-[80px]">
                                        <h3 className="font-bold text-slate-900 dark:text-white">#{String(order.id).padStart(6, '0')}</h3>
                                        <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">{order.shipping_name}</p>
                                        <p className="text-xs text-slate-500">{order.order_items?.length || 0} items • {order.payment_method}</p>
                                    </div>

                                    <div className="text-right px-4">
                                        <p className="font-bold text-primary">{formatPrice(order.total_amount)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <select
                                        value={order.status?.toUpperCase()}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            handleStatusChange(order.id, e.target.value);
                                        }}
                                        className={`px-2.5 py-1 rounded-full text-xs font-bold border-none outline-none cursor-pointer appearance-none text-center min-w-[100px] ${STATUS_COLORS[order.status?.toUpperCase()] || 'bg-slate-100 text-slate-600'}`}
                                    >
                                        {ORDER_STATUSES.map(status => (
                                            <option key={status} value={status} className="bg-white text-slate-900">{status}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedOrder(order);
                                        }}
                                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                                    >
                                        <span className="material-icons-round">visibility</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Order #{selectedOrder.id}</h2>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold mb-2">Customer Information</h3>
                                <p>{selectedOrder.shipping_name}</p>
                                <p className="text-sm text-slate-500">{selectedOrder.shipping_phone}</p>
                                <p className="text-sm text-slate-500">{selectedOrder.shipping_address}</p>
                            </div>

                            <div>
                                <h3 className="font-bold mb-2">Order Items</h3>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {selectedOrder.order_items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-white" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center">
                                                    <span className="material-icons-round text-slate-400">image</span>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                                                <p className="text-sm text-slate-500">
                                                    {item.size && <span className="mr-2">Size: {item.size}</span>}
                                                    {item.color && <span>Color: {item.color}</span>}
                                                </p>
                                                <div className="flex justify-between mt-1">
                                                    <p className="text-sm text-slate-500">{item.quantity} × {formatPrice(item.price)}</p>
                                                    <p className="font-bold text-slate-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Update Status</span>
                                    <select
                                        value={selectedOrder.status}
                                        onChange={(e) => {
                                            const newStatus = e.target.value;
                                            setSelectedOrder({ ...selectedOrder, status: newStatus }); // Optimistic update in modal
                                            handleStatusChange(selectedOrder.id, newStatus);
                                        }}
                                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-bold"
                                    >
                                        {ORDER_STATUSES.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">{formatPrice(selectedOrder.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
