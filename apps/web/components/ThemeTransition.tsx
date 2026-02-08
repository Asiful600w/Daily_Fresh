'use client';

import { useEffect } from 'react';

interface ThemeTransitionProps {
    isAnimating: boolean;
    originX: number;
    originY: number;
    targetTheme: 'light' | 'dark';
}

export function ThemeTransition({ isAnimating, originX, originY, targetTheme }: ThemeTransitionProps) {
    useEffect(() => {
        if (isAnimating) {
            // Prevent scrolling during animation
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isAnimating]);

    return (
        <div
            className={`theme-transition ${isAnimating ? 'active' : ''}`}
            style={{
                '--origin-x': `${originX}px`,
                '--origin-y': `${originY}px`,
                backgroundColor: targetTheme === 'dark' ? '#0f172a' : '#ffffff'
            } as React.CSSProperties}
        />
    );
}
