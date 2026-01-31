'use client';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function OrderSummary() {
    const { totalPrice, items, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Logic from HTML: Delivery Fee + Estimated Tax mocking
    const deliveryFee = 4.99;
    const estimatedTax = 1.25;
    const finalTotal = totalPrice + deliveryFee + estimatedTax;

    const handleCheckout = () => {
        if (!user) {
            router.push('/login?redirect=/checkout');
            return;
        }
        if (items.length === 0) return;

        router.push('/checkout');
    };

    return (
        <div className="lg:w-[380px]">
            <div className="sticky top-28 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700">
                <h2 className="text-xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white">Order Summary</h2>

                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                        <span className="text-sm">Subtotal</span>
                        <span className="text-base font-bold text-slate-900 dark:text-white">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                        <span className="text-sm">Delivery Fee</span>
                        <span className="text-base font-bold text-slate-900 dark:text-white">{formatPrice(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                        <span className="text-sm">Estimated Tax</span>
                        <span className="text-base font-bold text-slate-900 dark:text-white">{formatPrice(estimatedTax)}</span>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>

                    <div className="flex justify-between items-center text-slate-900 dark:text-white">
                        <span className="text-lg font-extrabold">Total</span>
                        <span className="text-2xl font-extrabold text-primary">{formatPrice(finalTotal)}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleCheckout}
                        disabled={isCheckingOut || items.length === 0}
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCheckingOut ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Proceed to Checkout
                                <span className="material-icons-round">arrow_forward</span>
                            </>
                        )}
                    </button>

                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <input
                                className="w-full h-11 pl-4 pr-16 rounded-lg border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:ring-primary focus:border-primary outline-none border text-slate-900 dark:text-white"
                                placeholder="Promo code"
                                type="text"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary font-bold text-sm px-2">Apply</button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest text-center mb-4">Secure Checkout</p>
                    <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <img className="h-4" alt="Visa" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtqruSyorBS-qgfx7ZoReMc3mmdTe-w9BBSbiVuhIwpUB7-q20ajX_tksDVLj-KKypcWJgQyglxZwoORA4te4uCIZnMnyVgImwozx4QoR0VzFNvjQeNVfWCFv2__ZAtt-y10I1MS6OZt1b5NFtaGGPYM7k6LVLrR6E0bAs2fWpAhzfP__ZqrxAOBOgQHnCc5D3ZNc2xAN7fNZMZfTV0dACWdLnW1n3dkIWPAvZ4hZvW9ToauEkgYO5AddPLzWkCHjrK08z-lqpCTU" />
                        <img className="h-6" alt="Mastercard" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLclIV06NUwPBe-33dwYFtkIXvujXO979UjeN5gkMvod7dLm1_-TD-jPdrtjrr1PUbLtd4M1r7SvAw71lPQfWEtqgo355P_0UenPPhLpZ8_7p6s6jBxyknPBLFFVz2TLTerdTjee4Y2uY4wHxNi1fsaNs7JjgpXPLdnzWSvuvfQ5UI62yePM6ZX5gJtzKQdJex2GA8Ofgjl-7EPpMOy6VumJbUUYfl17McVTokvgPBP20Bh__oqU4iLNn0h18Xkh_Qih_cR3wanUA" />
                        <img className="h-4" alt="Paypal" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYj4A4ze3Art3EWZBFpEtaRkbA4Ld_UV8wHrXTy7nbvaLII24da1tm1esO9pa80ODkjriF3L0kHgBOH1LVWPzd42qIOzWHm0jB0vkXHv8l44CBzSI6sg16YE6W8teC3jdMQqayLf-e1nsh0n-M3IRc9hCXfBVG0G8opKo3Jy7q0RKHwEtVVtA8EPkajrcqzjjAKJ8dxS59cKpEgp9GTixletgQ5V4DE4h2o0uZ4q0md5NyOx-w99CcwyyBrR8mUHhe2f7K1DhdaBQ" />
                        <img className="h-4" alt="Apple Pay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWmswRRX9jYZCiUX5GmHzpqOsPo0S4sYAXpvEdhM3Npy_q4JPGPYGPup162KR-VM4cqRdIYO_1c6LeK5Fbvm0WOxdDLg2dE_AIFt5ySrrXkakBhqgymzla85Zw0YobgEJ2KZBucCcMCyUA1G9M8jnWL_u0AZdueXPKmtRitVQ8ydG6Gm9qwWymNgQuSrIZAtsEQGMerfw6Ie9ZDLFe6CfkOdm1ulJU3rq5sqSXhrz-nKYc_mEV_-muznZ81TvEKtSQ9I_GX4djFtM" />
                    </div>
                </div>
            </div>
        </div>
    );
}
