
import { ProductInfo } from '@/components/product/ProductInfo';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import Link from 'next/link';
import { Reviews } from '@/components/product/Reviews';
import { getProduct, getProducts } from '@/lib/api';
import { ScrollReset } from '@/components/ScrollReset';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface ProductPageProps {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{
        sort?: string;
    }>;
}

export async function generateStaticParams() {
    // Ideally we fetch a subset or use caching, for now fetch all to generate paths
    const products = await getProducts();
    return products.map((product) => ({
        id: product.id.toString(),
    }));
}

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
    const params = await props.params;
    const { id } = params;
    const product = await getProduct(id);

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    return {
        title: `${product.name} | Daily Fresh`,
        description: product.description || `Buy ${product.name} at the best price.`,
    };
}

export default async function ProductPage(props: ProductPageProps) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const { id } = params;
    // const { sort } = searchParams; // Unused for now but good to have

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
