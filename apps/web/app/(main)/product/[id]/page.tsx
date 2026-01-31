
import { ProductInfo } from '@/components/product/ProductInfo';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import Link from 'next/link';
import { Reviews } from '@/components/product/Reviews';
import { getProduct, getProducts } from '@/lib/api';
import { ScrollReset } from '@/components/ScrollReset';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    // Ideally we fetch a subset or use caching, for now fetch all to generate paths
    const products = await getProducts();
    return products.map((product) => ({
        id: product.id.toString(),
    }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return notFound();
    }

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
            <ScrollReset />
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-8 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
                    <span className="material-icons-round text-base">arrow_back</span>
                    Back to Groceries
                </Link>
                <span className="mx-2">/</span>
                <span>{product.category || 'Products'}</span>
                <span className="mx-2">/</span>
                <span className="text-slate-900 dark:text-slate-200 font-medium">{product.name}</span>
            </div>


            <div className="mb-16">
                <ProductInfo product={product} />
            </div>

            <Reviews productId={product.id} />

            <RelatedProducts productId={product.id} />
        </main>
    );
}
