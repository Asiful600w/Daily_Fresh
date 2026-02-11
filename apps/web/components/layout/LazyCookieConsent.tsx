'use client';

import dynamic from 'next/dynamic';

const CookieConsentInner = dynamic(
    () => import('./CookieConsent').then(m => ({ default: m.CookieConsent })),
    { ssr: false }
);

export function LazyCookieConsent() {
    return <CookieConsentInner />;
}
