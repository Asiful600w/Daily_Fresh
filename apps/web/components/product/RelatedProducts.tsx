import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { getRelatedProducts } from '@/lib/api';

export async function RelatedProducts({ productId }: { productId: string | number }) {
    const related = await getRelatedProducts(productId);

    if (related.length === 0) return null;

    return (
        <section className="mt-20">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Related Products</h2>
                <Link className="text-primary font-semibold hover:underline" href="/category/vegetables">
                    View all
                </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {related.map((product, idx) => (
                    <div key={idx} className={idx === 4 ? 'hidden lg:block h-full' : 'h-full'}>
                        <ProductCard product={{ ...product, id: product.id }} />
                    </div>
                ))}
            </div>
        </section>
    );
}
