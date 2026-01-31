import Link from 'next/link';

const bannerGradient = "bg-gradient-to-br from-[#DCFCE7] to-[#F0FDF4] dark:from-[#14532D] dark:to-[#064E3B]";

export function HeroSection({ settings }: { settings?: any }) {
    return (
        <section className={`relative min-h-[400px] md:min-h-[480px] rounded-3xl overflow-hidden ${bannerGradient} flex items-center py-8 md:py-12`}>
            <div className="relative z-10 px-6 md:px-0 md:pl-16 max-w-xl space-y-4 md:space-y-6">
                <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-white/80 dark:bg-black/40 backdrop-blur-sm text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full shadow-sm">
                    {settings?.subtitle || 'New Season Freshness'}
                </span>
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold leading-tight text-slate-900 dark:text-white drop-shadow-sm">
                    {settings?.title || "Quality Food For Your"} <span className="text-primary">{settings?.title ? "" : "Healthy Life"}</span>
                </h1>
                <p className="text-base md:text-lg text-slate-700 dark:text-slate-200 max-w-xs md:max-w-md font-medium leading-relaxed drop-shadow-sm">
                    {settings?.description || 'Get up to 50% OFF on your first order. Fresh produce delivered from farm to your doorstep.'}
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 pt-2">
                    <button className="px-6 py-3 md:px-8 md:py-4 bg-primary text-white font-bold rounded-xl md:rounded-2xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:scale-95 text-sm md:text-base">
                        {settings?.button_text || 'Shop Now'}
                    </button>
                    <a href={settings?.button_link || "#special-offers"} className="px-6 py-3 md:px-8 md:py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-900 dark:text-white font-bold rounded-xl md:rounded-2xl border border-white/50 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-all text-center text-sm md:text-base shadow-sm">
                        View Offers
                    </a>
                </div>
            </div>

            {/* Background Image & Overlay */}
            <div className="absolute right-0 top-0 bottom-0 w-full md:w-2/3 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-[#DCFCE7] via-[#DCFCE7]/60 to-transparent dark:from-[#064E3B] dark:via-[#064E3B]/60 dark:to-transparent z-10 md:w-2/3"></div>
                <img
                    alt={settings?.title || "Fresh Vegetables"}
                    className="w-full h-full object-cover object-center transform scale-105"
                    src={settings?.image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBX7x1HBOqMMI518qHW17jKGkryeaKonnXGEbdkBR4GvbEVZENLzYW_8cEKLeU3nLCoxfDxvRuzBWc2UMxkRlp8Qix2LgxHKpsToQHO10vMCHMKjOmg6ucwmqOZ7GIMiSBIxBw0qaqFeK63SiQ5EQ4C-LMvZy28P7MaNy4uzcV2DaK1H5zIykFWkZMYBE6Xh8ac9E1nba7cTZ14OBTrDW-wpN-j8lDq-VbvUaLl6OtViD2uWDMpEBWT1yXDZluirbsS6BEgrgXwzyI"}
                />
            </div>



        </section>
    );
}
