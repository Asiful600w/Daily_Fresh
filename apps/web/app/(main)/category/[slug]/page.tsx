import { CategoryView } from '@/components/category/CategoryView';
import { CategoryHero } from '@/components/category/CategoryHero';
import { getCategory, getProductsByCategory } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ subcategory?: string, sort?: string }>;
}

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
    const params = await props.params;
    const { slug } = params;
    const category = await getCategory(slug);

    if (!category) {
        return {
            title: 'Category Not Found',
        };
    }

    return {
        title: `${category.name} | Daily Fresh`,
        description: `Shop for ${category.name} at Daily Fresh.`,
    };
}

export default async function CategoryPage(props: CategoryPageProps) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const { slug } = params;
    const { subcategory, sort } = searchParams;

    // Fetch category data
    const categoryData = await getCategory(slug);

    if (!categoryData) {
        return notFound();
    }

    // Fetch products
    const products = await getProductsByCategory(slug, subcategory, sort as any);

    return (
        <main className="max-w-[1400px] mx-auto px-6 py-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-6 text-sm font-medium">
                <Link className="text-slate-500 hover:text-primary" href="/">Home</Link>
                <span className="text-slate-300">/</span>
                <Link className={`text-slate-500 hover:text-primary ${subcategory ? '' : 'text-primary'}`} href={`/category/${slug}`}>
                    {categoryData.name}
                </Link>
                {subcategory && (
                    <>
                        <span className="text-slate-300">/</span>
                        <span className="text-primary">{subcategory}</span>
                    </>
                )}
            </div>

            {/* Hero Category Banner - HIDDEN if subcategory is selected */}
            {!subcategory && (
                <CategoryHero
                    title={categoryData.name}
                    image={categoryData.banner || categoryData.img}
                />
            )}

            <CategoryView
                products={products}
                categoryData={categoryData}
                slug={slug}
            />
        </main>
    );
}
