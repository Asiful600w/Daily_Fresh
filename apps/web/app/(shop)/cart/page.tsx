'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CartItem } from '@/components/cart/CartItem';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { RecentlyViewed } from '@/components/cart/RecentlyViewed';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';

import { useEffect } from 'react';

export default function CartPage() {
    const { items, totalItems } = useCart();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 xl:px-40 py-8">
            <CheckoutStepper currentStep={1} />

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-6">
                <Link className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium" href="/">
                    <span className="material-icons-round text-sm">arrow_back</span>
                    Continue Shopping
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-primary text-sm font-semibold">Shopping Cart</span>
            </div>

            <h1 className="text-3xl font-extrabold text-[#101814] dark:text-white mb-8 tracking-tight">
                Your Cart <span className="text-gray-400 font-normal">({totalItems} items)</span>
            </h1>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Items List */}
                <div className="flex-1 flex flex-col gap-4">
                    {items.map((item) => (
                        <CartItem key={item.id} item={item} />
                    ))}

                    {/* Free Shipping Promo */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <span className="material-icons-round">local_shipping</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-primary">Add $3.26 more for free delivery!</p>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2">
                                <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <OrderSummary />
            </div>

            <RecentlyViewed />
        </main>
    );
}
