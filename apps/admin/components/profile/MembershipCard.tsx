'use client';

export function MembershipCard() {
    return (
        <div className="p-6 rounded-2xl bg-[#10221c] text-white shadow-xl relative overflow-hidden">
            {/* Abstract pattern background */}
            <div className="absolute inset-0 opacity-10" data-alt="Abstract green pattern decoration">
                <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
                    <circle cx="90" cy="10" fill="#13eca4" r="30"></circle>
                    <circle cx="10" cy="90" fill="#13eca4" r="40"></circle>
                </svg>
            </div>
            <div className="relative z-10">
                <h3 className="text-primary font-bold mb-1">Daily Fresh Plus</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your subscription and billing details. You&apos;re currently on the <span className="text-primary font-medium">Free Plan</span>.</p>
                <p className="text-xl font-black mb-4">Unlimited Free Delivery</p>
                <p className="text-xs text-white/70 mb-6 leading-relaxed">You&apos;ve saved $124.00 in delivery fees this year. Keep enjoying the perks!</p>
                <button className="w-full py-2 bg-white text-[#10221c] rounded-lg text-sm font-bold hover:bg-primary transition-colors">Manage Membership</button>
            </div>
        </div>
    );
}
