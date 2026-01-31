'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';

export function RecentlyViewed() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                // For now, show best selling products as "You might also like"
                // In a real app, this would read from localStorage history
                const { getBestSellingProducts } = await import('@/lib/api');
                const data = await getBestSellingProducts(4);
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch recently viewed suggestions', error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    if (loading) return null; // Or skeleton
    if (products.length === 0) return null;

    return (
        <section className="mt-20">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-extrabold tracking-tight text-[#101814] dark:text-white">You might also like</h2>
                <Link className="text-primary font-bold text-sm flex items-center gap-1" href="/shop">
                    View All
                    <span className="material-icons-round text-sm">arrow_forward</span>
                </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </section>
    );
}
