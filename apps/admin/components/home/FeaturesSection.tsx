export function FeaturesSection() {
    const features = [
        { icon: 'local_shipping', title: 'Free Shipping', subtitle: 'On orders over $50' },
        { icon: 'verified_user', title: 'Secure Payment', subtitle: '100% secure payment' },
        { icon: 'eco', title: '100% Organic', subtitle: 'Directly from farms' },
        { icon: 'support_agent', title: '24/7 Support', subtitle: 'We are here to help' },
    ];

    return (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-t border-slate-100 dark:border-slate-800">
            {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-icons-round">{feature.icon}</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{feature.title}</h4>
                        <p className="text-xs text-slate-500">{feature.subtitle}</p>
                    </div>
                </div>
            ))}
        </section>
    );
}
