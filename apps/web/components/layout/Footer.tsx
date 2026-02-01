import Link from 'next/link';
import { Category } from '@/lib/api';

interface FooterProps {
    categories?: Category[];
}

export function Footer({ categories = [] }: FooterProps) {
    return (
        <footer className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <span className="material-icons-round text-white">eco</span>
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Daily<span className="text-primary">Fresh</span></span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Connecting you to the freshest harvest. We bring premium organic groceries straight from the farm to your kitchen with love and care.
                    </p>
                    <div className="flex gap-4">
                        {['facebook', 'alternate_email'].map(icon => (
                            <a key={icon} className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary hover:border-primary transition-all" href="#">
                                <span className="material-icons-round text-sm">{icon}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Quick Links</h4>
                    <ul className="space-y-4 text-sm text-slate-500">
                        <li><Link className="hover:text-primary transition-colors" href="#">About Us</Link></li>
                        <li><Link className="hover:text-primary transition-colors" href="#">Our Farmers</Link></li>
                        <li><Link className="hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link></li>
                        <li><Link className="hover:text-primary transition-colors" href="/terms">Terms of Service</Link></li>
                    </ul>
                </div>

                {/* Categories */}
                <div>
                    <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Categories</h4>
                    <ul className="space-y-4 text-sm text-slate-500">
                        {categories.slice(0, 6).map(category => (
                            <li key={category.id}>
                                <Link className="hover:text-primary transition-colors" href={`/category/${category.slug}`}>
                                    {category.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Newsletter</h4>
                    <p className="text-sm text-slate-500 mb-4">Subscribe to get notified about discounts.</p>
                    <form className="space-y-3">
                        <input className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-primary outline-none" placeholder="Your email address" type="email" />
                        <button className="w-full bg-primary text-white font-bold py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-all">Subscribe Now</button>
                    </form>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                © 2026 Daily Fresh Groceries. All rights reserved. Built for quality and freshness.
            </div>
        </footer>
    );
}

