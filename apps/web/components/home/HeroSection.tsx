import Link from 'next/link';

const bannerGradient = "bg-gradient-to-br from-[#DCFCE7] to-[#F0FDF4] dark:from-[#14532D] dark:to-[#064E3B]";

export function HeroSection({ settings }: { settings?: any }) {
    return (
        <section className="relative min-h-[500px] md:min-h-[600px] rounded-3xl overflow-hidden flex items-center py-12 md:py-20 group border border-slate-200 dark:border-slate-700 transition-colors">
            {/* Background Image with Zoom Effect */}
            <div className="absolute inset-0 z-0">
                <img
                    alt={settings?.title || "Fresh Vegetables"}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 dark:brightness-[0.85]"
                    src={settings?.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop"}
                />
                {/* Premium Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10 dark:from-black/95 dark:via-black/80"></div>
            </div>

            <div className="relative z-20 px-8 md:px-16 max-w-2xl space-y-6">
                <span className="inline-block px-4 py-1.5 bg-white/20 dark:bg-white/10 backdrop-blur-md text-white text-xs md:text-sm font-bold uppercase tracking-[0.2em] rounded-full border border-white/30 dark:border-white/20">
                    {settings?.subtitle || 'Organic & Fresh'}
                </span>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight text-white drop-shadow-lg">
                    {settings?.title || "Nature's Best"} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300">
                        {settings?.title ? "" : "Just for You"}
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-200 dark:text-gray-100 max-w-md font-medium leading-relaxed drop-shadow-md">
                    {settings?.description || 'Experience the freshest produce delivered directly from local farms to your table. Taste the difference today.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link href="/shop" className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-[0_10px_20px_rgba(34,197,94,0.3)] hover:shadow-[0_15px_30px_rgba(34,197,94,0.4)] hover:-translate-y-1 transition-all active:scale-95 text-base flex items-center justify-center gap-2">
                        <span className="material-icons-round">shopping_bag</span>
                        {settings?.button_text || 'Shop Now'}
                    </Link>
                    <a href={settings?.button_link || "#special-offers"} className="px-8 py-4 bg-white/10 dark:bg-white/5 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 dark:border-white/30 hover:bg-white hover:text-slate-900 dark:hover:bg-white dark:hover:text-slate-900 transition-all text-center text-base flex items-center justify-center gap-2">
                        View Offers
                    </a>
                </div>
            </div>
        </section>
    );
}
