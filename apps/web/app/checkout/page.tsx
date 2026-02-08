'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { createOrderAction } from '@/actions/orders';
import { Address, getUserAddresses, saveAddress } from '@/actions/address';
import { formatPrice } from '@/lib/format';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';

export default function CheckoutPage() {
    const { user, loading: authLoading } = useAuth();
    const { items: cart, totalPrice, clearCart } = useCart();
    const router = useRouter();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isNewAddress, setIsNewAddress] = useState(false);
    const [loading, setLoading] = useState(false);

    // New Address Form
    const [newAddress, setNewAddress] = useState({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Bangladesh',
        saveForLater: true
    });

    useEffect(() => {
        if (user) {
            setNewAddress(prev => ({
                ...prev,
                fullName: user.user_metadata?.full_name || prev.fullName,
                phone: user.phone || user.user_metadata?.phone || prev.phone
            }));
        }
    }, [user]);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) return;
            try {
                const data = await getUserAddresses();
                setAddresses(data);
                // Auto-select default
                const defaultAddr = data.find(a => a.isDefault) || data[0];
                if (defaultAddr) setSelectedAddressId(defaultAddr.id);
                else setIsNewAddress(true); // No addresses, force new
            } catch (error) {
                console.error(error);
            }
        };

        if (!authLoading && !user) {
            router.push('/login?redirect=/checkout');
        } else if (user) {
            fetchAddresses();
        }
    }, [user, authLoading, router]);

    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

    const handlePlaceOrder = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Prepare shipping details
            let finalShippingDetails = { name: '', phone: '', address: '' };
            if (isNewAddress || !selectedAddressId) {
                if (!newAddress.fullName || !newAddress.street || !newAddress.phone || !newAddress.city) {
                    alert('Please fill in all required shipping fields.');
                    setLoading(false);
                    return;
                }
                finalShippingDetails = {
                    name: newAddress.fullName,
                    phone: newAddress.phone,
                    address: `${newAddress.street}, ${newAddress.city}, ${newAddress.state} ${newAddress.postalCode}, ${newAddress.country}`
                };
                if (newAddress.saveForLater) {
                    await saveAddress({ ...newAddress, label: 'Home', isDefault: addresses.length === 0 });
                }
            } else {
                const addr = addresses.find(a => a.id === selectedAddressId);
                if (!addr) throw new Error('Selected address not found');
                finalShippingDetails = {
                    name: addr.fullName,
                    phone: addr.phone,
                    address: `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`
                };
            }

            const total = totalPrice * 1.05;

            console.log('Placing order...');
            console.log('User ID:', user.id);
            console.log('Total:', total);
            console.log('Cart items:', cart.length);

            const result = await createOrderAction(user.id, total, cart, finalShippingDetails, 'cod');

            if (!result.success) {
                console.error('Order creation failed:', result.error);
                throw new Error(result.error || 'Failed to create order');
            }

            console.log('Order created successfully:', result.orderId);

            // Trigger Animation
            setShowSuccessAnimation(true);

            // Wait longer for animation and to ensure order is committed to database
            setTimeout(async () => {
                try {
                    // Attempt to clear cart, but don't block navigation if it fails/hangs
                    await clearCart().catch(e => console.error("Failed to clear cart:", e));
                } catch (e) {
                    console.error("Cart clear exception:", e);
                } finally {
                    if (result.orderId) {
                        router.push(`/orders/${result.orderId}?success=true`);
                    } else {
                        console.error("No order ID returned");
                        // Fallback to profile orders or home
                        router.push('/profile/orders');
                    }
                }
            }, 3500);

        } catch (error: any) {
            console.error('Checkout failed:', error);
            console.error('Error message:', error?.message);
            console.error('Error details:', error?.details);
            console.error('Error hint:', error?.hint);
            alert(`Failed to place order: ${error?.message || 'Please try again.'}`);
            setLoading(false);
        }
    };

    if (showSuccessAnimation) {
        return (
            <div className="fixed inset-0 z-50 bg-white dark:bg-[#0d1b17] flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 bg-white dark:bg-[#0d1b17] rounded-full m-2 flex items-center justify-center border-4 border-primary shadow-2xl shadow-primary/40">
                        <span className="material-icons-round text-6xl text-primary animate-bounce">receipt_long</span>
                    </div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Generating Receipt</h2>
                <p className="text-slate-500 font-medium animate-pulse">Please wait while we confirm your order...</p>
            </div>
        );
    }

    if (authLoading || (!user && loading)) return null;

    if (cart.length === 0 && !loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4">
                <div className="text-center">
                    <span className="material-icons-round text-6xl text-slate-300 mb-4">shopping_cart</span>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Your cart is empty</h2>
                    <button onClick={() => router.push('/')} className="mt-4 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:-translate-y-1 transition-all">
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f0f9f6] dark:bg-[#0d1b17] min-h-screen py-8 lg:py-12">
            <div className="max-w-7xl mx-auto px-4">
                <CheckoutStepper currentStep={2} />

                {/* Header */}
                <div className="flex items-center gap-2 mb-8">
                    <h1 className="text-4xl font-black text-[#0d1b17] dark:text-white tracking-tight">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Address & Payment */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Shipping Address Section */}
                        <div className="bg-white dark:bg-[#10221c] p-6 md:p-8 rounded-3xl shadow-sm border border-[#cfe7df] dark:border-[#1e3a31]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-[#4c9a80] flex items-center justify-center text-white shadow-lg shadow-[#4c9a80]/30">
                                    <span className="material-icons-round">place</span>
                                </div>
                                <h2 className="text-2xl font-bold text-[#0d1b17] dark:text-white">Shipping Address</h2>
                            </div>

                            {/* Address Selector */}
                            {!isNewAddress && addresses.length > 0 && (
                                <div className="grid gap-4 mb-6">
                                    {addresses.map(addr => (
                                        <div
                                            key={addr.id}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300'}`}
                                        >
                                            <div className="flex justify-between">
                                                <span className="font-bold text-[#0d1b17] dark:text-white">{addr.label} ({addr.fullName})</span>
                                                {selectedAddressId === addr.id && <span className="material-icons-round text-primary">check_circle</span>}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">{addr.street}, {addr.city}</p>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => { setIsNewAddress(true); setSelectedAddressId(null); }}
                                        className="text-primary font-bold text-sm hover:underline flex items-center gap-1 w-fit"
                                    >
                                        <span className="material-icons-round text-sm">add</span> Add New Address
                                    </button>
                                </div>
                            )}

                            {/* New Address Form */}
                            {(isNewAddress || addresses.length === 0) && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {addresses.length > 0 && (
                                        <button onClick={() => setIsNewAddress(false)} className="text-slate-400 text-sm hover:text-slate-600 mb-2 flex items-center gap-1">
                                            <span className="material-icons-round text-sm">arrow_back</span> Back to Saved Addresses
                                        </button>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <CheckoutInput label="Full Name" placeholder="Alex Johnson" value={newAddress.fullName} onChange={v => setNewAddress({ ...newAddress, fullName: v })} />
                                        <CheckoutInput label="Phone Number" placeholder="+880 1XXX..." value={newAddress.phone} onChange={v => setNewAddress({ ...newAddress, phone: v })} />
                                    </div>
                                    <CheckoutInput label="Street Address" placeholder="123 Orchard Lane" value={newAddress.street} onChange={v => setNewAddress({ ...newAddress, street: v })} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <CheckoutInput label="City" placeholder="Dhaka" value={newAddress.city} onChange={v => setNewAddress({ ...newAddress, city: v })} />
                                        <CheckoutInput label="Zip Code" placeholder="1212" value={newAddress.postalCode} onChange={v => setNewAddress({ ...newAddress, postalCode: v })} />
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="checkbox"
                                            id="saveAddress"
                                            checked={newAddress.saveForLater}
                                            onChange={e => setNewAddress({ ...newAddress, saveForLater: e.target.checked })}
                                            className="rounded border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="saveAddress" className="text-sm font-medium text-slate-600 dark:text-slate-300">Save this address for future orders</label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Details Section */}
                        <div className="bg-white dark:bg-[#10221c] p-6 md:p-8 rounded-3xl shadow-sm border border-[#cfe7df] dark:border-[#1e3a31]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#4c9a80] flex items-center justify-center text-white shadow-lg shadow-[#4c9a80]/30">
                                        <span className="material-icons-round">payments</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#0d1b17] dark:text-white">Payment Details</h2>
                                </div>
                                <div className="flex items-center gap-1 text-[#4c9a80] text-xs font-bold uppercase tracking-wider">
                                    <span className="material-icons-round text-sm">lock</span> Secure SSL
                                </div>
                            </div>

                            {/* Card Details Mock (Disabled/Visual Only) */}
                            <div className="opacity-50 pointer-events-none relative mb-6 grayscale text-sm">
                                <div className="absolute inset-0 z-10 flex items-center justify-center">
                                    <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-500">Coming Soon</span>
                                </div>
                                <div className="space-y-4">
                                    <CheckoutInput label="Cardholder Name" placeholder="Name as it appears on card" value="" onChange={() => { }} />
                                    <CheckoutInput label="Card Number" placeholder="0000 0000 0000 0000" value="" onChange={() => { }} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <CheckoutInput label="Expiry Date" placeholder="MM/YY" value="" onChange={() => { }} />
                                        <CheckoutInput label="CVV" placeholder="***" value="" onChange={() => { }} />
                                    </div>
                                </div>
                            </div>

                            {/* COD Option (Active) */}
                            <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 shadow-sm flex items-center gap-3">
                                <span className="material-icons-round text-primary text-2xl">local_shipping</span>
                                <div>
                                    <h3 className="font-bold text-[#0d1b17] dark:text-white">Cash on Delivery</h3>
                                    <p className="text-xs text-slate-500">Pay automatically when you receive your order.</p>
                                </div>
                                <span className="ml-auto material-icons-round text-primary">check_circle</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Review */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-[#10221c] p-6 md:p-8 rounded-3xl shadow-sm border border-[#cfe7df] dark:border-[#1e3a31] sticky top-24">
                            <h2 className="text-2xl font-bold text-[#0d1b17] dark:text-white mb-6">Order Review</h2>

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-lg shrink-0 overflow-hidden">
                                            <Image
                                                src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.png'}
                                                alt={item.name}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-[#0d1b17] dark:text-white line-clamp-1">{item.name}</h4>
                                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                            <p className="font-bold text-primary text-sm mt-1">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 py-4 border-t border-b border-slate-100 dark:border-slate-800 mb-6">
                                <div className="flex justify-between text-base">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-base">
                                    <span className="text-slate-500">Shipping</span>
                                    <span className="font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs">FREE</span>
                                </div>
                                <div className="flex justify-between text-base">
                                    <span className="text-slate-500">Tax</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(totalPrice * 0.05)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="text-lg font-bold text-[#0d1b17] dark:text-white">Total</span>
                                <span className="text-3xl font-black text-[#0d1b17] dark:text-white">{formatPrice(totalPrice * 1.05)}</span>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full py-4 bg-[#4c9a80] hover:bg-[#3d8b72] text-white font-bold rounded-2xl shadow-lg shadow-[#4c9a80]/30 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                Place Your Order <span className="material-icons-round">arrow_forward</span>
                            </button>

                            <p className="text-[10px] text-slate-400 text-center mt-4 leading-tight">
                                By placing your order, you agree to Daily Fresh's <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>
                            </p>

                            <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="material-icons-round text-xs">verified_user</span> 256-BIT SSL
                                </div>
                                <div className="w-px h-4 bg-slate-200" />
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="material-icons-round text-xs">eco</span> Organic Certified
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CheckoutInput({ label, placeholder, value, onChange }: { label: string, placeholder: string, value: string, onChange: (v: string) => void }) {
    return (
        <div>
            <label className="block text-xs font-bold text-[#0d1b17] dark:text-white mb-2 ml-1">{label}</label>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4c9a80]/50 focus:border-[#4c9a80] transition-all text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
            />
        </div>
    );
}
