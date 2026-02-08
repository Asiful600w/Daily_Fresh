'use client';
import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Category, searchProducts, Product } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/format';
import { useUI } from '@/context/UIContext';
import { useTheme } from 'next-themes';
import { ThemeTransition } from '@/components/ThemeTransition';

function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<Product[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [showDropdown, setShowDropdown] = React.useState(false);

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 1) {
                setIsSearching(true);
                try {
                    const data = await searchProducts(query);
                    setResults(data);
                    setShowDropdown(true);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (productId: number | string) => {
        router.push(`/product/${productId}`);
        setShowDropdown(false);
        setQuery('');
    };

    return (
        <div className="relative w-full group">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                search
            </span>
            <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-900 dark:text-white"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length > 1 && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay to allow click
            />

            {/* Suggestions Dropdown */}
            {showDropdown && results.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-[100]">
                    {results.map((product) => (
                        <div
                            key={product.id}
                            className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                            onClick={() => handleSelect(product.id)}
                        >
                            <img src={product.images && product.images.length > 0 ? product.images[0] : ''} alt={product.name} className="w-10 h-10 object-contain p-1 bg-white rounded-lg border border-slate-100 dark:border-slate-600" />
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{product.name}</h4>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-primary font-bold">{formatPrice(product.price)}</span>
                                    {product.category && <span className="text-slate-400">• {product.category}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {showDropdown && query.length > 1 && results.length === 0 && !isSearching && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl p-4 text-center text-sm text-slate-500 z-[100]">
                    No products found.
                </div>
            )}
        </div>
    );
}

export function NavBar({ categories }: { categories: Category[] }) {
    const { totalItems } = useCart();
    const { user, signOut } = useAuth();
    // const user = { user_metadata: { full_name: "Test User", avatar_url: null } }; const signOut = async () => { };

    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [animationOrigin, setAnimationOrigin] = React.useState({ x: 0, y: 0 });
    const [targetTheme, setTargetTheme] = React.useState<'light' | 'dark'>('light');

    // Wait for theme to hydrate
    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (isAnimating || !mounted) return; // Prevent clicks before theme loads

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const newTheme = theme === 'dark' ? 'light' : 'dark';

        // Set origin first, then start animation
        setAnimationOrigin({ x, y });
        setTargetTheme(newTheme);

        // Double RAF to ensure state updates complete before animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setIsAnimating(true);
            });
        });

        // Change theme early (25% through) so navbar changes first
        setTimeout(() => {
            setTheme(newTheme);
        }, 300);

        // End animation
        setTimeout(() => {
            setIsAnimating(false);
        }, 1200);
    };

    const { openSearch } = useUI();

    return (
        <>
            <ThemeTransition
                isAnimating={isAnimating}
                originX={animationOrigin.x}
                originY={animationOrigin.y}
                targetTheme={targetTheme}
            />
            <header className={`sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-all duration-300`}>
                {/* Top Bar */}
                <div className={`max-w-7xl mx-auto px-4 w-full flex items-center justify-between gap-4 transition-all duration-300 ${isScrolled ? 'h-14' : 'h-20'}`}>
                    {/* Logo */}
                    <Link href="/" className={`flex items-center gap-2 shrink-0 cursor-pointer transition-all duration-500 origin-left ${isScrolled ? 'scale-75' : 'scale-100'}`}>
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="material-icons-round text-white">eco</span>
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Daily<span className="text-primary">Fresh</span>
                        </span>
                    </Link>

                    {/* Search Bar - Hidden on Mobile */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8 z-50">
                        <SearchBar />
                    </div>

                    {/* Mobile Actions (Search & DarkMode) */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            onClick={openSearch}
                        >
                            <span className="material-icons-round text-xl">search</span>
                        </button>
                        <button
                            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            onClick={toggleTheme}
                        >
                            <span className="material-icons-round text-xl">
                                {mounted ? (theme === 'dark' ? 'light_mode' : 'dark_mode') : 'dark_mode'}
                            </span>
                        </button>
                        {user ? (
                            <button
                                className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                onClick={signOut}
                            >
                                <span className="material-icons-round text-xl">logout</span>
                            </button>
                        ) : (
                            <Link href="/login" className="px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                                <span className="text-xs font-bold">Login/Signup</span>
                            </Link>
                        )}
                    </div>

                    {/* Desktop Actions */}
                    <div className="flex items-center gap-4 hidden md:flex">
                        <button
                            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            onClick={toggleTheme}
                        >
                            <span className="material-icons-round text-xl">
                                {mounted ? (theme === 'dark' ? 'light_mode' : 'dark_mode') : 'dark_mode'}
                            </span>
                        </button>

                        <Link href="/cart" className="relative cursor-pointer" id="cart-icon-container">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition-all group">
                                <span className="material-icons-round text-xl group-hover:scale-110 transition-transform">shopping_cart</span>
                            </div>
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-3">


                                <div className="hidden lg:block text-right">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.user_metadata?.full_name || 'User'}</p>
                                    <button onClick={() => signOut()} className="text-xs text-slate-500 hover:text-red-500 font-medium">Sign Out</button>
                                </div>
                                <Link href="/profile" className="flex items-center gap-2 pl-1 pr-1 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                        {user.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-icons-round text-slate-400 text-lg">person</span>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                                <span className="text-sm font-bold">Login</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Secondary Nav */}
                <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 hidden md:block">
                    <div className="max-w-7xl mx-auto px-4 relative flex flex-wrap items-center justify-center gap-x-1 lg:gap-x-4">
                        {categories.map((category) => {
                            const slug = category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                            return (
                                <div key={category.name} className="group relative">
                                    <Link
                                        href={`/category/${slug}`}
                                        className="px-3 lg:px-5 py-3 block text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary whitespace-nowrap"
                                    >
                                        {category.name}
                                    </Link>

                                    {/* Dropdown Menu */}
                                    <div className="absolute top-full left-0 w-56 bg-white dark:bg-slate-900 shadow-xl rounded-b-2xl border-x border-b border-slate-100 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                                        <div className="p-2 space-y-1">
                                            {category.subcategories.map((sub) => (
                                                <Link
                                                    key={sub.name}
                                                    href={`/category/${slug}?subcategory=${encodeURIComponent(sub.name)}`}
                                                    className="block px-4 py-2.5 text-xs lg:text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary rounded-xl transition-colors"
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </nav>
            </header>
        </>
    );
}
