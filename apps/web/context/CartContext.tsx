'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { createClient } from '@/lib/supabase/client';

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

// Helper: Read cart from LocalStorage
function readLocalCart(): CartItem[] {
    try {
        const raw = localStorage.getItem('cart');
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.error('CartContext: Failed to read localStorage cart', e);
    }
    return [];
}

// Helper: Write cart to LocalStorage
function writeLocalCart(items: CartItem[]) {
    try {
        localStorage.setItem('cart', JSON.stringify(items));
    } catch (e) {
        console.error('CartContext: Failed to write localStorage cart', e);
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [supabase] = useState(() => createClient());
    const [items, setItems] = useState<CartItem[]>(() => {
        // Lazy initializer: read from LocalStorage on first render (SSR-safe)
        if (typeof window === 'undefined') return [];
        return readLocalCart();
    });
    const [loading] = useState(false);
    const [dbCartId, setDbCartId] = useState<string | null>(null);

    // ─────────────────────────────────────────────
    // STEP 2: Sync with Supabase once auth is ready
    // ─────────────────────────────────────────────
    useEffect(() => {
        if (authLoading) return;
        if (!user) return; // Guest user - LocalStorage is enough

        const sync = async () => {
            try {
                // 2a. Ensure we have a valid session
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    console.warn('CartContext: No session found, skipping DB sync');
                    return;
                }

                // 2b. Get or create the user's cart
                let cartId: string | null = null;

                const { data: existingCart, error: cartErr } = await supabase
                    .from('carts')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (cartErr) {
                    console.error('CartContext: Error fetching cart:', cartErr);
                    return;
                }

                if (existingCart) {
                    cartId = existingCart.id;
                } else {
                    // Create new cart
                    const { data: newCart, error: createErr } = await supabase
                        .from('carts')
                        .insert({ user_id: user.id })
                        .select('id')
                        .single();

                    if (createErr) {
                        console.error('CartContext: Error creating cart:', createErr);
                        return;
                    }
                    cartId = newCart?.id || null;
                }

                if (!cartId) return;
                setDbCartId(cartId);

                // 2c. Fetch cart items from DB
                const { data: dbItems, error: itemsErr } = await supabase
                    .from('cart_items')
                    .select('*')
                    .eq('cart_id', cartId);

                if (itemsErr) {
                    console.error('CartContext: Error fetching cart items:', itemsErr);
                    return;
                }

                if (dbItems && dbItems.length > 0) {
                    // DB has items → use those as the source of truth
                    const mapped: CartItem[] = dbItems.map((item: any) => ({
                        id: item.product_id,
                        name: item.name,
                        price: Number(item.price),
                        images: [item.image || ''],
                        quantity: item.quantity,
                        category: item.category,
                        pack: item.pack,
                        color: item.color,
                        size: item.size,
                    }));
                    setItems(mapped);
                    writeLocalCart(mapped);
                } else {
                    // DB is empty - push local items to DB if we have any
                    const localItems = readLocalCart();
                    if (localItems.length > 0) {
                        const rows = localItems.map(item => ({
                            cart_id: cartId!,
                            product_id: String(item.id),
                            name: item.name,
                            price: item.price,
                            image: item.images?.[0] || '',
                            quantity: item.quantity,
                            category: item.category || null,
                            pack: item.pack || null,
                            color: item.color || null,
                            size: item.size || null,
                        }));

                        const { error: pushErr } = await supabase
                            .from('cart_items')
                            .insert(rows);

                        if (pushErr) {
                            console.error('CartContext: Error pushing local items to DB:', pushErr);
                        }
                    }
                }
            } catch (error) {
                console.error('CartContext: Sync error:', error);
            }
        };

        sync();
    }, [user, authLoading, supabase]);

    // ─────────────────────────────────────────────
    // STEP 3: Save to LocalStorage whenever items change
    // ─────────────────────────────────────────────
    useEffect(() => {
        if (!loading) {
            writeLocalCart(items);
        }
    }, [items, loading]);

    // ─────────────────────────────────────────────
    // Helper: Get or create the DB cart ID
    // ─────────────────────────────────────────────
    const getCartId = useCallback(async (): Promise<string | null> => {
        if (dbCartId) return dbCartId;
        if (!user) return null;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;

            const { data: existingCart } = await supabase
                .from('carts')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (existingCart) {
                setDbCartId(existingCart.id);
                return existingCart.id;
            }

            const { data: newCart, error: createErr } = await supabase
                .from('carts')
                .insert({ user_id: user.id })
                .select('id')
                .single();

            if (createErr) {
                console.error('CartContext: Error creating cart in getCartId:', createErr);
                return null;
            }

            if (newCart) {
                setDbCartId(newCart.id);
                return newCart.id;
            }
        } catch (e) {
            console.error('CartContext: getCartId error:', e);
        }
        return null;
    }, [user, dbCartId, supabase]);

    // ─────────────────────────────────────────────
    // ADD ITEM
    // ─────────────────────────────────────────────
    const addItem = async (newItem: CartItem) => {
        // 1. Always update UI immediately
        setItems(prev => {
            const idx = prev.findIndex(i =>
                String(i.id) === String(newItem.id) &&
                (i.color || null) === (newItem.color || null)
            );
            if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + newItem.quantity };
                return updated;
            }
            return [...prev, newItem];
        });

        // 2. If user is logged in, sync to DB
        if (user) {
            try {
                const cartId = await getCartId();
                if (!cartId) {
                    console.error('CartContext: addItem - could not get cartId');
                    return;
                }

                // Check if this product already exists in DB cart
                const { data: existing } = await supabase
                    .from('cart_items')
                    .select('id, quantity')
                    .eq('cart_id', cartId)
                    .eq('product_id', String(newItem.id))
                    .eq('color', newItem.color || '')
                    .maybeSingle();

                if (existing) {
                    // Update quantity
                    const { error } = await supabase
                        .from('cart_items')
                        .update({ quantity: existing.quantity + newItem.quantity })
                        .eq('id', existing.id);

                    if (error) console.error('CartContext: Error updating cart item:', error);
                } else {
                    // Insert new item
                    const { error } = await supabase
                        .from('cart_items')
                        .insert({
                            cart_id: cartId,
                            product_id: String(newItem.id),
                            name: newItem.name,
                            price: newItem.price,
                            image: newItem.images?.[0] || '',
                            quantity: newItem.quantity,
                            category: newItem.category || null,
                            pack: newItem.pack || null,
                            color: newItem.color || null,
                            size: newItem.size || null,
                        });

                    if (error) console.error('CartContext: Error inserting cart item:', error);
                }
            } catch (error) {
                console.error('CartContext: addItem DB sync error:', error);
            }
        }
    };

    // ─────────────────────────────────────────────
    // REMOVE ITEM
    // ─────────────────────────────────────────────
    const removeItem = async (id: number | string, color?: string) => {
        setItems(prev => prev.filter(item => !(
            String(item.id) === String(id) &&
            (item.color || null) === (color || null)
        )));

        if (user) {
            try {
                const cartId = await getCartId();
                if (!cartId) return;

                let q = supabase
                    .from('cart_items')
                    .delete()
                    .eq('cart_id', cartId)
                    .eq('product_id', String(id));

                if (color) q = q.eq('color', color);
                else q = q.is('color', null);

                const { error } = await q;
                if (error) console.error('CartContext: Error removing cart item:', error);
            } catch (error) {
                console.error('CartContext: removeItem DB sync error:', error);
            }
        }
    };

    // ─────────────────────────────────────────────
    // UPDATE QUANTITY
    // ─────────────────────────────────────────────
    const updateQuantity = async (id: number | string, delta: number, color?: string) => {
        let newQty = 0;

        setItems(prev => prev.map(item => {
            if (String(item.id) === String(id) && (item.color || null) === (color || null)) {
                newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));

        if (user) {
            try {
                const cartId = await getCartId();
                if (!cartId) return;

                let q = supabase
                    .from('cart_items')
                    .update({ quantity: newQty })
                    .eq('cart_id', cartId)
                    .eq('product_id', String(id));

                if (color) q = q.eq('color', color);
                else q = q.is('color', null);

                const { error } = await q;
                if (error) console.error('CartContext: Error updating quantity:', error);
            } catch (error) {
                console.error('CartContext: updateQuantity DB sync error:', error);
            }
        }
    };

    // ─────────────────────────────────────────────
    // CLEAR CART
    // ─────────────────────────────────────────────
    const clearCart = async () => {
        setItems([]);

        if (user) {
            try {
                const cartId = await getCartId();
                if (!cartId) return;

                const { error } = await supabase
                    .from('cart_items')
                    .delete()
                    .eq('cart_id', cartId);

                if (error) console.error('CartContext: Error clearing cart:', error);
            } catch (error) {
                console.error('CartContext: clearCart DB sync error:', error);
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
