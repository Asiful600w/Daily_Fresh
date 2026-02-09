'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getOrderDetails } from '@/actions/orders';
import { formatPrice } from '@/lib/format';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const isSuccess = searchParams.get('success') === 'true';
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const fetchOrder = async (attempt = 0) => {
            try {
                // Wait for auth to handle session restoration first
                if (authLoading) return;

                // If no user, redirect
                if (!user) {
                    router.push('/login?redirect=/orders/' + id);
                    return;
                }

                setError(null);
                console.log(`Fetching order ${id}, attempt ${attempt + 1}`);

                // Timeout for server action
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timed out')), 10000)
                );

                // Use Server Action instead of client API
                // Type casting id to matching expected type (string | number)
                const data = await Promise.race([
                    getOrderDetails(id as string),
                    timeoutPromise
                ]) as any;

                if (!data) {
                    // Order not found - might need to retry if it was just created
                    if (attempt < 3 && isSuccess) {
                        console.log('Order not found, retrying in 2 seconds...');
                        setTimeout(() => {
                            setRetryCount(prev => prev + 1);
                        }, 2000);
                        return;
                    }
                    setError('Order not found. It may have been deleted or you may not have permission to view it.');
                    setLoading(false);
                    return;
                }

                if (data.user_id !== user.id) {
                    console.error('Order user_id mismatch:', data.user_id, 'vs', user.id);
                    setError('You do not have permission to view this order.');
                    setLoading(false);
                    return;
                }

                console.log('Order loaded successfully:', data.id);
                setOrder(data);
                setLoading(false);
            } catch (error: any) {
                console.error('Error fetching order:', error);

                // Retry logic for transient errors
                if (attempt < 3 && isSuccess) {
                    console.log('Error fetching order, retrying in 2 seconds...');
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                    }, 2000);
                } else {
                    setError(error?.message || 'Failed to load order details. Please try again.');
                    setLoading(false);
                }
            }
        };

        if (!authLoading) {
            fetchOrder(retryCount);
        }
    }, [user, authLoading, id, router, retryCount, isSuccess]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading order details...</p>
                    {retryCount > 0 && <p className="text-xs text-slate-400 mt-2">Retry attempt {retryCount}/3</p>}
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
                <div className="text-center max-w-md">
                    <span className="material-icons-round text-6xl text-red-400 mb-4">error_outline</span>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Unable to Load Order</h2>
                    <p className="text-slate-500 mb-6">{error || 'Order not found'}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => router.push('/profile/orders')}
                            className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                        >
                            View All Orders
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:-translate-y-1 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f9f6] dark:bg-[#0d1b17] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {isSuccess && <CheckoutStepper currentStep={3} />}

                {/* Success Banner */}
                {isSuccess && (
                    <div className="bg-white dark:bg-[#10221c] p-8 rounded-3xl shadow-sm border border-green-100 dark:border-green-900/30 text-center animate-in zoom-in-50 duration-500">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <span className="material-icons-round text-5xl text-green-600 dark:text-green-400">check_circle</span>
                        </div>
                        <h1 className="text-3xl font-black text-[#0d1b17] dark:text-white mb-2">Thank You for Your Order!</h1>
                        <p className="text-slate-500 dark:text-slate-400">Your order has been placed successfully.</p>
                        <p className="text-sm font-bold text-[#4c9a80] mt-4">Order ID: #{order.id.slice(0, 8)}</p>
                    </div>
                )}

                <div>
                    {!isSuccess && (
                        <div onClick={() => router.push('/profile/orders')} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-4 w-fit cursor-pointer">
                            <span className="material-icons-round text-lg">arrow_back</span>
                            Back to My Orders
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-[#10221c] rounded-3xl shadow-sm border border-[#cfe7df] dark:border-[#1e3a31] overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-[#0d1b17] dark:text-white">Order Details</h2>
                            <p className="text-sm text-slate-500 mt-1">Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}</p>
                        </div>
                        <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-bold uppercase tracking-wider">
                            {order.status}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6 md:p-8 space-y-6">
                        {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0">
                                    {/* Prioritize current product image (index 0), then snapshot image */}
                                    {(item.products?.images && item.products.images.length > 0) || item.image ? (
                                        <Image
                                            src={item.products?.images?.[0] || item.image}
                                            alt={item.name}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <span className="material-icons-round">image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-[#0d1b17] dark:text-white line-clamp-1">{item.name}</h3>
                                    <p className="text-sm text-slate-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                    <div className="flex gap-2 mt-1">
                                        {item.size && (
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                Size: {item.size}
                                            </span>
                                        )}
                                        {item.color && (
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                Color: {item.color}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right font-bold text-[#0d1b17] dark:text-white">
                                    {formatPrice(item.price * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="bg-slate-50 dark:bg-[#162d25] p-6 md:p-8 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                            <span className="font-bold text-[#0d1b17] dark:text-white">{formatPrice(order.total_amount / 1.05)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Shipping</span>
                            <span className="font-bold text-green-600">Free</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Tax</span>
                            <span className="font-bold text-[#0d1b17] dark:text-white">{formatPrice(order.total_amount - (order.total_amount / 1.05))}</span>
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 my-4 pt-4 flex justify-between items-center">
                            <span className="text-lg font-bold text-[#0d1b17] dark:text-white">Total</span>
                            <span className="text-2xl font-black text-[#4c9a80]">{formatPrice(order.total_amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Shipping Info */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-[#10221c] p-6 rounded-3xl shadow-sm border border-[#cfe7df] dark:border-[#1e3a31]">
                        <h3 className="font-bold text-[#0d1b17] dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-[#4c9a80]">local_shipping</span> Shipping Address
                        </h3>
                        <p className="font-bold text-sm">{order.shipping_name}</p>
                        <p className="text-sm text-slate-500 mt-1">{order.shipping_address}</p>
                        <p className="text-sm text-slate-500 mt-1">{order.shipping_phone}</p>
                    </div>
                    <div className="bg-white dark:bg-[#10221c] p-6 rounded-3xl shadow-sm border border-[#cfe7df] dark:border-[#1e3a31]">
                        <h3 className="font-bold text-[#0d1b17] dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-[#4c9a80]">payments</span> Payment Method
                        </h3>
                        <p className="font-bold text-sm uppercase">{order.payment_method}</p>

                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 pb-8">
                    <button onClick={() => router.push('/profile/orders')} className="px-8 py-3 bg-white dark:bg-[#10221c] text-[#0d1b17] dark:text-white border-2 border-[#cfe7df] dark:border-[#1e3a31] font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-[#1e3a31] transition-all">
                        Back to Orders
                    </button>
                    <button onClick={() => router.push('/')} className="px-8 py-3 bg-[#4c9a80] hover:bg-[#3d8b72] text-white font-bold rounded-xl shadow-lg shadow-[#4c9a80]/30 transition-all hover:-translate-y-1">
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}
