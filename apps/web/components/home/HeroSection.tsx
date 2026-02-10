import Link from 'next/link';
import Image from 'next/image';


export function HeroSection({ settings }: { settings?: any }) {
    return (
        <section className="relative min-h-[320px] md:min-h-[600px] rounded-2xl md:rounded-3xl overflow-hidden flex items-center py-8 md:py-20 group border border-slate-200 dark:border-slate-700 transition-colors">
            {/* Background Image with Zoom Effect */}
            <div className="absolute inset-0 z-0">
                <Image
                    alt={settings?.title || "Fresh Vegetables"}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105 dark:brightness-[0.85]"
                    src={settings?.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop"}
                />
                {/* Premium Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10 dark:from-black/95 dark:via-black/80"></div>
            </div>

            <div className="relative z-20 px-5 md:px-16 max-w-2xl space-y-3 md:space-y-6">
                <span className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 bg-white/20 dark:bg-white/10 backdrop-blur-md text-white text-[9px] md:text-sm font-bold uppercase tracking-[0.2em] rounded-full border border-white/30 dark:border-white/20">
                    {settings?.subtitle || 'Organic & Fresh'}
                </span>
                <h1 className="text-2xl md:text-6xl lg:text-7xl font-black leading-tight text-white drop-shadow-lg">
                    {settings?.title || "Nature's Best"} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300">
                        {settings?.title ? "" : "Just for You"}
                    </span>
                </h1>
                <p className="text-sm md:text-xl text-gray-200 dark:text-gray-100 max-w-md font-medium leading-relaxed drop-shadow-md">
                    {settings?.description || 'Experience the freshest produce delivered directly from local farms to your table. Taste the difference today.'}
                </p>

                <div className="flex flex-row gap-2 md:gap-4 pt-1 md:pt-4">
                    <Link href={settings?.button_link || "/shop"} className="px-4 py-2.5 md:px-8 md:py-4 bg-primary text-white font-bold rounded-lg md:rounded-2xl shadow-[0_10px_20px_rgba(34,197,94,0.3)] hover:shadow-[0_15px_30px_rgba(34,197,94,0.4)] hover:-translate-y-1 transition-all active:scale-95 text-xs md:text-base inline-flex items-center gap-1.5 md:gap-2 whitespace-nowrap">
                        <span className="material-icons-round text-sm md:text-xl">shopping_bag</span>
                        {settings?.button_text || "Shop Now"}
                    </Link>
                    <a href="#special-offers" className="px-4 py-2.5 md:px-8 md:py-4 bg-white/10 dark:bg-white/5 backdrop-blur-md text-white font-bold rounded-lg md:rounded-2xl border border-white/20 dark:border-white/30 hover:bg-white hover:text-slate-900 dark:hover:bg-white dark:hover:text-slate-900 transition-all text-xs md:text-base inline-flex items-center gap-1.5 md:gap-2 whitespace-nowrap">
                        View Offers
                    </a>
                </div>
            </div>
        </section>
    );
}
