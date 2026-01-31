import { getProducts, getCategories } from '@/lib/api';
import { ShopView } from '@/components/shop/ShopView';

export default async function ShopPage() {
    // Fetch all needed data
    // optimization: In a real app we might paginate the initial fetch, but for now we fetch all as requested
    const [products, categories] = await Promise.all([
        getProducts(),
        getCategories()
    ]);

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark pt-4 pb-20 px-4 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Shop All</h1>
                <p className="text-slate-500 dark:text-slate-400">Discover our full range of fresh produce and groceries.</p>
            </div>

            <ShopView products={products} categories={categories} />
        </main>
    );
}
