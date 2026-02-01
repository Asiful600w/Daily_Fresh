'use client';

export function MembershipCard() {
    return (
        <div className="p-6 rounded-2xl bg-[#10221c] text-white shadow-xl relative overflow-hidden opacity-90">
            {/* Abstract pattern background */}
            <div className="absolute inset-0 opacity-10" data-alt="Abstract green pattern decoration">
                <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
                    <circle cx="90" cy="10" fill="#13eca4" r="30"></circle>
                    <circle cx="10" cy="90" fill="#13eca4" r="40"></circle>
                </svg>
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-primary font-bold">Daily Fresh Plus</h3>
                    <span className="text-[10px] uppercase font-bold bg-white/10 px-2 py-0.5 rounded text-white/80">Coming Soon</span>
                </div>
                <p className="text-xl font-black mb-4">Unlimited Free Delivery</p>
                <p className="text-xs text-white/70 mb-6 leading-relaxed">
                    Get ready for unlimited free delivery and exclusive savings. We're launching our premium membership program soon!
                </p>
                <button
                    disabled
                    className="w-full py-2 bg-white/20 text-white/50 rounded-lg text-sm font-bold cursor-not-allowed"
                >
                    Manage Membership
                </button>
            </div>
        </div>
    );
}
