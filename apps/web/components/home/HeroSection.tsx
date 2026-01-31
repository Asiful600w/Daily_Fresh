import Link from 'next/link';

const bannerGradient = "bg-gradient-to-br from-[#DCFCE7] to-[#F0FDF4] dark:from-[#14532D] dark:to-[#064E3B]";

export function HeroSection({ settings }: { settings?: any }) {
    return (
        <section className={`relative min-h-[480px] rounded-3xl overflow-hidden ${bannerGradient} flex items-center py-12`}>
            <div className="relative z-10 pl-16 max-w-xl space-y-6">
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full">
                    {settings?.subtitle || 'New Season Freshness'}
                </span>
                <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white">
                    {settings?.title || "Quality Food For Your"} <span className="text-primary">{settings?.title ? "" : "Healthy Life"}</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                    {settings?.description || 'Get up to 50% OFF on your first order. Fresh produce delivered from farm to your doorstep.'}
                </p>
                <div className="flex items-center gap-4">
                    <button className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:scale-95">
                        {settings?.button_text || 'Shop Now'}
                    </button>
                    <a href={settings?.button_link || "#special-offers"} className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-center">
                        View Offers
                    </a>
                </div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none">
                <img
                    alt={settings?.title || "Fresh Vegetables"}
                    className="w-full h-full object-cover opacity-90 mix-blend-multiply dark:mix-blend-overlay"
                    src={settings?.image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBX7x1HBOqMMI518qHW17jKGkryeaKonnXGEbdkBR4GvbEVZENLzYW_8cEKLeU3nLCoxfDxvRuzBWc2UMxkRlp8Qix2LgxHKpsToQHO10vMCHMKjOmg6ucwmqOZ7GIMiSBIxBw0qaqFeK63SiQ5EQ4C-LMvZy28P7MaNy4uzcV2DaK1H5zIykFWkZMYBE6Xh8ac9E1nba7cTZ14OBTrDW-wpN-j8lDq-VbvUaLl6OtViD2uWDMpEBWT1yXDZluirbsS6BEgrgXwzyI"}
                />
            </div>



        </section>
    );
}
