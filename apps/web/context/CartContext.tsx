'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

export interface CartItem {
    id: number | string;
    name: string;
    price: number;
    images: string[];
    quantity: number;
    category?: string;
    pack?: string;
    color?: string;
    size?: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => Promise<void>;
    removeItem: (id: number | string, color?: string) => Promise<void>;
    updateQuantity: (id: number | string, delta: number, color?: string) => Promise<void>;
    clearCart: () => Promise<void>;
    totalPrice: number;
    totalItems: number;
    loading: boolean;
}

const defaultContext: CartContextType = {
    items: [],
    addItem: async () => { },
    removeItem: async () => { },
    updateQuantity: async () => { },
    clearCart: async () => { },
    totalPrice: 0,
    totalItems: 0,
    loading: true
};

const CartContext = createContext<CartContextType>(defaultContext);

export function CartProvider({ children }: { children: ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initial load
    useEffect(() => {
        if (authLoading) return;

        const loadCart = async () => {
            setLoading(true);
            if (user) {
                // Load from Supabase
                try {
                    // Get cart_id for user, or create if not exists
                    const { data: initialCart, error: cartError } = await supabase
                        .from('carts')
                        .select('id')
                        .eq('user_id', user.id)
                        .single();

                    let cart = initialCart;

                    if (cartError && cartError.code === 'PGRST116') {
                        // Cart doesn't exist, create it
                        const { data: newCart, error: createError } = await supabase
                            .from('carts')
                            .insert([{ user_id: user.id }])
                            .select('id')
                            .single();

                        if (createError) {
                            // If unique violation (23505), it means it was created concurrently or hidden
                            if (createError.code === '23505') {
                                const { data: existingCart, error: retryError } = await supabase
                                    .from('carts')
                                    .select('id')
                                    .eq('user_id', user.id)
                                    .single();

                                if (retryError) throw retryError;
                                cart = existingCart;
                            } else {
                                throw createError;
                            }
                        } else {
                            cart = newCart;
                        }
                    } else if (cartError) {
                        throw cartError;
                    }

                    if (cart) {
                        const { data: cartItems, error: itemsError } = await supabase
                            .from('cart_items')
                            .select('*')
                            .eq('cart_id', cart.id);

                        if (itemsError) throw itemsError;

                        if (cartItems) {
                            const mappedItems: CartItem[] = cartItems.map(item => ({
                                id: item.product_id,
                                name: item.name,
                                price: item.price,
                                images: [item.image], // Map legacy stored image string to array
                                quantity: item.quantity,
                                category: item.category,
                                pack: item.pack,
                                color: item.color
                            }));
                            setItems(mappedItems);
                        }
                    }

                } catch (error) {
                    console.error("Error loading cart from Supabase:", error);
                }

            } else {
                // Load from LocalStorage
                const storedCart = localStorage.getItem('cart');
                if (storedCart) {
                    try {
                        setItems(JSON.parse(storedCart));
                    } catch (error) {
                        console.error('Failed to parse cart from local storage:', error);
                        setItems([]);
                    }
                } else {
                    // Explicitly clear items if no local cart found (e.g. after logout)
                    setItems([]);
                }
            }
            setLoading(false);
            setIsInitialized(true);
        };

        loadCart();
    }, [user, authLoading]);

    // Save to LocalStorage (Always sync as backup/cache)
    useEffect(() => {
        if (!authLoading && isInitialized) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, authLoading, isInitialized]);


    // Helper to sanitize optional fields for DB equality checks
    const sanitizeAttr = (val: string | undefined): string | null => {
        return val ? val : null;
    };

    const addItem = async (newItem: CartItem) => {
        // Normalize new item attributes
        const color = sanitizeAttr(newItem.color);
        const size = sanitizeAttr(newItem.size);
        const pack = sanitizeAttr(newItem.pack);

        if (user) {
            // Optimistic UI update
            setItems(currentItems => {
                const existingItem = currentItems.find(item =>
                    String(item.id) === String(newItem.id) &&
                    sanitizeAttr(item.color) === color &&
                    sanitizeAttr(item.size) === size &&
                    sanitizeAttr(item.pack) === pack
                );

                if (existingItem) {
                    return currentItems.map(item =>
                        (String(item.id) === String(newItem.id) &&
                            sanitizeAttr(item.color) === color &&
                            sanitizeAttr(item.size) === size &&
                            sanitizeAttr(item.pack) === pack)
                            ? { ...item, quantity: item.quantity + newItem.quantity }
                            : item
                    );
                }
                return [...currentItems, newItem];
            });

            try {
                // Fetch cart ID or create if missing
                let { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();

                if (!cart) {
                    const { data: newCart, error: createError } = await supabase
                        .from('carts')
                        .insert([{ user_id: user.id }])
                        .select('id')
                        .single();
                    if (createError) throw createError;
                    cart = newCart;
                }

                if (!cart) return;

                // Check dependencies using specific filters matching the sanitization
                let query = supabase
                    .from('cart_items')
                    .select('*')
                    .eq('cart_id', cart.id)
                    .eq('product_id', newItem.id);

                // Add explicit filters for optional attributes
                if (color) query = query.eq('color', color);
                else query = query.is('color', null);

                // Note: unique constraint is (cart_id, product_id, color). 
                // We trust the constraint but need to find the specific row to update.
                const { data: existingDbItems } = await query;

                // Manual filtering if needed (to be extra safe against DB weirdness) or just take first
                const existingDbItem = existingDbItems && existingDbItems.length > 0 ? existingDbItems[0] : null;

                if (existingDbItem) {
                    const { error: updateError } = await supabase
                        .from('cart_items')
                        .update({ quantity: existingDbItem.quantity + newItem.quantity })
                        .eq('id', existingDbItem.id);

                    if (updateError) console.error("CartContext: Update item error:", updateError);
                } else {
                    const { error: insertError } = await supabase.from('cart_items').insert([{
                        cart_id: cart.id,
                        product_id: String(newItem.id), // Ensure string
                        name: newItem.name,
                        price: newItem.price,
                        image: newItem.images[0] || '',
                        quantity: newItem.quantity,
                        category: newItem.category,
                        pack: pack,
                        color: color,
                        size: size
                    }]);

                    if (insertError) console.error("CartContext: Insert item error:", insertError);
                }

            } catch (error) {
                console.error("Error adding item to Supabase cart:", error);
            }

        } else {
            // Guest Logic
            setItems(currentItems => {
                const existingItem = currentItems.find(item =>
                    String(item.id) === String(newItem.id) &&
                    item.color === newItem.color // Simple check for guest
                );
                if (existingItem) {
                    return currentItems.map(item =>
                        (String(item.id) === String(newItem.id) && item.color === newItem.color)
                            ? { ...item, quantity: item.quantity + newItem.quantity }
                            : item
                    );
                }
                return [...currentItems, newItem];
            });
        }
    };

    const removeItem = async (id: number | string, color?: string) => {
        const normColor = sanitizeAttr(color);

        setItems(currentItems => currentItems.filter(item => {
            const isSameId = String(item.id) === String(id);
            const isSameColor = sanitizeAttr(item.color) === normColor;
            return !(isSameId && isSameColor);
        }));

        if (user) {
            try {
                const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
                if (cart) {
                    let query = supabase
                        .from('cart_items')
                        .delete()
                        .eq('cart_id', cart.id)
                        .eq('product_id', id);

                    if (normColor) query = query.eq('color', normColor);
                    else query = query.is('color', null);

                    await query;
                }
            } catch (error) {
                console.error("Error removing item from Supabase cart:", error);
            }
        }
    };

    const updateQuantity = async (id: number | string, delta: number, color?: string) => {
        const normColor = sanitizeAttr(color);
        let newQuantity = 0;

        setItems(currentItems =>
            currentItems.map(item => {
                if (String(item.id) === String(id) && sanitizeAttr(item.color) === normColor) {
                    newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );

        if (user) {
            try {
                const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
                if (cart) {
                    let query = supabase
                        .from('cart_items')
                        .update({ quantity: newQuantity })
                        .eq('cart_id', cart.id)
                        .eq('product_id', id);

                    if (normColor) query = query.eq('color', normColor);
                    else query = query.is('color', null);

                    await query;
                }
            } catch (error) {
                console.error("Error updating item quantity in Supabase cart:", error);
            }
        }
    };

    const clearCart = async () => {
        setItems([]);
        if (user) {
            try {
                const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
                if (cart) {
                    await supabase.from('cart_items').delete().eq('cart_id', cart.id);
                }
            } catch (error) {
                console.error("Error clearing Supabase cart:", error);
            }
        }
    };

    const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalPrice, totalItems, loading }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
