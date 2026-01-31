'use client';
import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

// Types
interface FlyingItem {
    id: number;
    image: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    delay?: number;
}

interface FlyToCartContextType {
    triggerFly: (srcElement: HTMLElement, image: string, quantity?: number) => void;
}

const FlyToCartContext = createContext<FlyToCartContextType | undefined>(undefined);

export function FlyToCartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<FlyingItem[]>([]);
    const countRef = useRef(0);

    const triggerFly = (srcElement: HTMLElement, image: string, quantity: number = 1) => {
        let cartIcon = document.getElementById('cart-icon-container');

        // Check if mobile cart is visible (or just check existence)
        const mobileCartIcon = document.getElementById('mobile-cart-icon-container');
        if (mobileCartIcon && window.getComputedStyle(mobileCartIcon).display !== 'none') {
            cartIcon = mobileCartIcon;
        }

        if (!cartIcon && !mobileCartIcon) return; // Fallback
        if (!cartIcon) cartIcon = mobileCartIcon || document.getElementById('cart-icon-container');

        if (!cartIcon) return;

        const srcRect = srcElement.getBoundingClientRect();
        const destRect = cartIcon.getBoundingClientRect();

        // Target center of cart icon
        const endX = destRect.left + destRect.width / 2;
        const endY = destRect.top + destRect.height / 2;

        const newItems: FlyingItem[] = [];

        for (let i = 0; i < quantity; i++) {
            const id = countRef.current++;

            // Adjust start to be center of button/image
            const startX = srcRect.left + srcRect.width / 2;
            const startY = srcRect.top + srcRect.height / 2;

            newItems.push({
                id,
                image,
                startX,
                startY,
                endX,
                endY,
                delay: i * 100 // 100ms stagger
            });
        }

        setItems(prev => [...prev, ...newItems]);

        // Clean up after animation (max delay + duration)
        const maxDelay = (quantity - 1) * 100;
        setTimeout(() => {
            setItems(prev => prev.filter(item => !newItems.find(ni => ni.id === item.id)));
        }, 1000 + maxDelay);
    };

    return (
        <FlyToCartContext.Provider value={{ triggerFly }}>
            {children}
            {/* Animation Overlay */}
            {items.map((item) => {
                // Calculate translation
                const tx = item.endX - item.startX;
                const ty = item.endY - item.startY;

                // We actually want to position absolute at START, then translate to END
                const style: React.CSSProperties = {
                    position: 'fixed',
                    left: item.startX,
                    top: item.startY,
                    width: '80px',
                    height: '80px',
                    zIndex: 9999,
                    pointerEvents: 'none',
                    backgroundImage: `url(${item.image || '/placeholder-food.png'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '50%', // Circle looks better flying? or rounded square? stick to rounded square but maybe more pillowy
                    border: '4px solid white',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    // CSS Variables for animation
                    // @ts-ignore
                    '--tx': `${tx}px`,
                    // @ts-ignore
                    '--ty': `${ty}px`,
                    animation: `flyToCart 1s cubic-bezier(0.1, 0.7, 0.1, 1) forwards`, // Slower, smoother curve
                    animationDelay: `${item.delay}ms`
                };

                return (
                    <div
                        key={item.id}
                        style={style}
                        className="flying-item"
                    />
                );
            })}
            <style jsx global>{`
                @keyframes flyToCart {
                    0% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(0.5); /* Start small (from button) */
                    }
                    10% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1.1); /* Pop up */
                    }
                    30% {
                        transform: translate(-50%, -50%) scale(1);
                    }
                    90% {
                        opacity: 1; /* Stay visible */
                        transform: translate(calc(-50% + var(--tx) * 0.9), calc(-50% + var(--ty) * 0.9)) scale(0.5);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.2);
                    }
                }
            `}</style>
        </FlyToCartContext.Provider>
    );
}

export function useFlyToCart() {
    const context = useContext(FlyToCartContext);
    if (!context) {
        throw new Error('useFlyToCart must be used within a FlyToCartProvider');
    }
    return context;
}
