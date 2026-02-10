'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

export function CartProvider({ children }: { children: ReactNode }) {
    const { user, loading: authLoading, refreshSession } = useAuth();
    const [supabase] = useState(() => createClient());
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    // 1. Immediate LocalStorage load (Instant UI)
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            try {
                setItems(JSON.parse(storedCart));
            } catch (error) {
                console.error('Failed to parse cart from local storage:', error);
            }
        }
        setLoading(false);
    }, []);

    // 2. Supabase Sync (Source of truth for logged-in users)
    useEffect(() => {
        if (authLoading) return;

        const syncWithSupabase = async () => {
            if (!user) {
                setIsInitialized(true);
                return;
            }

            console.log('CartContext: Starting Supabase sync for user:', user.id);

            try {
                if (refreshSession) await refreshSession();

                // Get or create cart
                let { data: cart, error: cartError } = await supabase.from('carts').select('id').eq('user_id', user.id).single();

                if (cartError && cartError.code === 'PGRST116') {
                    console.log('CartContext: No cart found, creating new cart');
                    const { data: newCart, error: createError } = await supabase
                        .from('carts')
                        .insert([{ user_id: user.id }])
                        .select('id')
                        .single();
                    if (createError) {
                        console.error('CartContext: Failed to create cart:', createError);
                    } else {
                        cart = newCart;
                        console.log('CartContext: Created new cart:', cart);
                    }
                }

                if (cart) {
                    console.log('CartContext: Fetching cart items for cart:', cart.id);
                    const { data: cartItems, error: itemsError } = await supabase
                        .from('cart_items')
                        .select('*')
                        .eq('cart_id', cart.id);

                    if (itemsError) {
                        console.error('CartContext: Error fetching cart items:', itemsError);
                    } else {
                        console.log('CartContext: Fetched cart items from DB:', cartItems);
                        console.log('CartContext: Current local items count:', items.length);

                        if (cartItems && cartItems.length > 0) {
                            const mappedItems: CartItem[] = cartItems.map((item: any) => ({
                                id: item.product_id,
                                name: item.name,
                                price: item.price,
                                images: [item.image],
                                quantity: item.quantity,
                                category: item.category,
                                pack: item.pack,
                                color: item.color,
                                size: item.size
                            }));
                            console.log('CartContext: Overwriting local items with DB items');
                            setItems(mappedItems);
                        } else {
                            console.log('CartContext: DB cart is empty, keeping local items');
                            // DON'T overwrite local items with empty DB - let addItem handle syncing
                        }
                    }
                }
            } catch (error) {
                console.error("CartContext: Supabase sync failed:", error);
            } finally {
                console.log('CartContext: Sync complete, setting initialized');
                setIsInitialized(true);
            }
        };

        syncWithSupabase();
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
        // DIAGNOSTIC: Log auth state
        console.log('=== ADD ITEM DIAGNOSTICS ===');
        console.log('User object:', user);
        console.log('User ID:', user?.id);
        console.log('Auth loading:', authLoading);
        console.log('Is initialized:', isInitialized);
        console.log('Item to add:', newItem);

        // Normalize new item attributes
        const color = sanitizeAttr(newItem.color);
        const size = sanitizeAttr(newItem.size);
        const pack = sanitizeAttr(newItem.pack);

        if (user) {
            console.log('CartContext: User is authenticated, proceeding with DB sync');

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
                console.log('CartContext: Fetching or creating cart for user:', user.id);

                // Fetch cart ID or create if missing
                let { data: cart, error: fetchError } = await supabase.from('carts').select('id').eq('user_id', user.id).single();

                if (fetchError) {
                    console.log('CartContext: Cart fetch error:', fetchError);
                    if (fetchError.code === 'PGRST116') {
                        console.log('CartContext: Creating new cart');
                        const { data: newCart, error: createError } = await supabase
                            .from('carts')
                            .insert([{ user_id: user.id }])
                            .select('id')
                            .single();
                        if (createError) {
                            console.error('CartContext: CRITICAL - Failed to create cart:', createError);
                            throw createError;
                        }
                        cart = newCart;
                        console.log('CartContext: Created cart:', cart);
                    } else {
                        throw fetchError;
                    }
                }

                if (!cart) {
                    console.error('CartContext: CRITICAL - No cart available after fetch/create');
                    return;
                }

                console.log('CartContext: Using cart:', cart.id);

                // Check dependencies using specific filters matching the sanitization
                console.log('CartContext: Checking for existing cart item');
                let query = supabase
                    .from('cart_items')
                    .select('*')
                    .eq('cart_id', cart.id)
                    .eq('product_id', String(newItem.id));

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

                    if (updateError) console.warn("CartContext: Update item error (UI already updated):", updateError);
                } else {
                    const insertPayload = {
                        cart_id: cart.id,
                        product_id: String(newItem.id),
                        name: newItem.name,
                        price: newItem.price,
                        image: newItem.images[0] || '',
                        quantity: newItem.quantity,
                        category: newItem.category,
                        pack: pack,
                        color: color,
                        size: size
                    };

                    console.log('CartContext: Attempting to insert cart item:', insertPayload);

                    const { data: insertedData, error: insertError } = await supabase
                        .from('cart_items')
                        .insert([insertPayload])
                        .select();

                    if (insertError) {
                        console.error("CartContext: CRITICAL - Failed to insert cart item:", insertError);
                        console.error("CartContext: Insert payload was:", insertPayload);
                        console.error("CartContext: Error details:", {
                            message: insertError.message,
                            code: insertError.code,
                            details: insertError.details,
                            hint: insertError.hint
                        });
                    } else {
                        console.log('CartContext: Successfully inserted cart item:', insertedData);
                    }
                }

            } catch (error: any) {
                console.error("CartContext: CRITICAL ERROR syncing item to database:", error);
                console.error("CartContext: Error stack:", error?.stack);
                console.error("CartContext: Error details:", {
                    message: error?.message,
                    code: error?.code,
                    details: error?.details
                });
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
                console.warn("CartContext: Error removing item from database (UI already updated):", error);
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
                console.warn("CartContext: Error updating quantity in database (UI already updated):", error);
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
                console.warn("CartContext: Error clearing database cart (UI already updated):", error);
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
