"use client";

import Image from "next/image";
// import { useEffect, useRef, useState } from "react";

const ads = [
    "/legacy_assets/images/card1.png",
    "/legacy_assets/images/card2.png",
    "/legacy_assets/images/card3.png",
    "/legacy_assets/images/card1.png", // Duplicates for seamless looping if needed, or we just map twice
    "/legacy_assets/images/card2.png",
    "/legacy_assets/images/card3.png",
];

export function AdvertiseScroller({ ads = [] }: { ads?: string[] }) {
    // Fallback if no ads provided
    const displayAds = ads.length > 0 ? ads : [
        "/legacy_assets/images/card1.png",
        "/legacy_assets/images/card2.png",
        "/legacy_assets/images/card3.png",
    ];

    return (
        <div className="w-full bg-white dark:bg-slate-900 py-4 overflow-hidden">
            <div className="flex gap-4 animate-scroll whitespace-nowrap w-max hover:[animation-play-state:paused]">
                {[...displayAds, ...displayAds, ...displayAds].map((src, index) => (
                    <div
                        key={index}
                        className="relative w-[300px] h-[160px] md:w-[400px] md:h-[220px] bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm flex-shrink-0"
                    >
                        <Image
                            src={src}
                            alt={`Advertisement ${index + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                ))}
            </div>
            <style jsx>{`
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
        </div>
    );
}
