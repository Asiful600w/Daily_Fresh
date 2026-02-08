"use client";

export function NoticeScroller({ notices = [] }: { notices?: string[] }) {
    // If no notices, don't render anything
    if (notices.length === 0) {
        return null;
    }

    // Duplicate list to ensure smooth infinite scroll
    const items = [...notices, ...notices, ...notices, ...notices];

    return (
        <div className="w-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground py-2 overflow-hidden border-y border-primary/20 relative">
            <div className="flex animate-marquee whitespace-nowrap min-w-full">
                {items.map((text, i) => (
                    <span key={i} className="mx-8 font-medium text-sm flex-shrink-0 flex items-center gap-2">
                        {text.startsWith('📢') ? text : (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                {text}
                            </>
                        )}
                    </span>
                ))}
            </div>
            <style jsx>{`
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                    width: max-content; /* Ensure it takes full width of content */
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
                @keyframes marquee {
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
