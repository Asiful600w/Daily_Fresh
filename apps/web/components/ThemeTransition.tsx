'use client';

import { useEffect } from 'react';

interface ThemeTransitionProps {
    mode: 'none' | 'filling' | 'unfilling';
    originX: number;
    originY: number;
}

export function ThemeTransition({ mode, originX, originY }: ThemeTransitionProps) {
    useEffect(() => {
        if (mode !== 'none') {
            // Prevent scrolling during animation
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [mode]);

    return (
        <div
            className={`theme-transition ${mode}`}
            style={{
                '--origin-x': `${originX}px`,
                '--origin-y': `${originY}px`
            } as React.CSSProperties}
        />
    );
}
