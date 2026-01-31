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
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-6 md:pb-0 scrollbar-hide">
                {related.map((product, idx) => (
                    <div key={idx} className={`snap-center shrink-0 w-[160px] md:w-auto ${idx === 4 ? 'hidden lg:block h-full' : 'h-full'}`}>
                        <ProductCard product={{ ...product, id: product.id }} />
                    </div>
                ))}
            </div>
        </section>
    );
}
