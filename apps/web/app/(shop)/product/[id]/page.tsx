
import { Suspense } from 'react';
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

    const title = product.metaTitle || `${product.name} | Daily Fresh`;
    const description = product.metaDescription || product.description || `Buy ${product.name} at the best price from Daily Fresh.`;

    return {
        title,
        description,
        keywords: product.keywords,
        openGraph: {
            title,
            description,
            images: product.ogImage || (product.images && product.images.length > 0 ? [product.images[0]] : []),
            type: 'website',
            url: product.canonicalUrl || `https://dailyfresh.com/product/${id}`, // ideally slug
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: product.ogImage || (product.images && product.images.length > 0 ? [product.images[0]] : []),
        },
        alternates: {
            canonical: product.canonicalUrl,
        },
        robots: {
            index: !product.noIndex,
            follow: !product.noIndex,
        }
    };
}

export default async function ProductPage(props: ProductPageProps) {
    const params = await props.params;
    const { id } = params;

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

            <Suspense fallback={<ReviewsSkeleton />}>
                <Reviews productId={product.id} />
            </Suspense>

            <Suspense fallback={<RelatedProductsSkeleton />}>
                <RelatedProducts productId={product.id} />
            </Suspense>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: product.name,
                        description: product.metaDescription || product.description,
                        image: product.images,
                        offers: {
                            '@type': 'Offer',
                            price: product.price,
                            priceCurrency: 'BDT',
                            availability: product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                        },
                        // Add brand, sku, etc if available
                    })
                }}
            />
        </main>
    );
}

function ReviewsSkeleton() {
    return (
        <section className="py-12 border-t border-slate-100 dark:border-slate-700 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    {[1, 2].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
            </div>
        </section>
    );
}

function RelatedProductsSkeleton() {
    return (
        <section className="mt-20 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i}>
                        <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                        <div className="mt-4 space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
