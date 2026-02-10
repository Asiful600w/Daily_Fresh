import { CategoryView } from '@/components/category/CategoryView';
import { CategoryHero } from '@/components/category/CategoryHero';
import { getProductsBySpecialCategory, getSpecialCategories } from '@/lib/api';
import { notFound } from 'next/navigation';

interface OfferPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{
        sort?: string;
    }>;
}

// Generate static params if we want, or just dynamic
// For dynamic offers, usually dynamic rendering is fine.

export default async function OfferPage(props: OfferPageProps) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const { slug } = params;
    const { sort } = searchParams;
    const offerName = decodeURIComponent(slug);

    // Check if offer exists (optional, or just handle empty products)
    const offers = await getSpecialCategories();
    // Assuming we want to show details even if inactive? API filters active only.
    const currentOffer = offers.find(o => o.name === offerName);

    if (!currentOffer) {
        // Fallback or 404. Let's redirect to home or 404.
        notFound();
    }

    const products = await getProductsBySpecialCategory(offerName, sort);

    // Construct a virtual Category object for the view
    const categoryData = {
        id: String(currentOffer.id),
        name: currentOffer.name,
        slug: slug,
        img: currentOffer.image_url || '',
        subcategories: [] // No subcategories for offers usually
    };

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
            <CategoryHero
                title={currentOffer.name}
                // Use offer image if high res? Or fallback pattern?
                // CategoryHero usually expects a banner image.
                // We'll use the offer image for the specific page banner too.
                image={currentOffer.image_url || ''}
                description={currentOffer.description}
            />

            <CategoryView
                products={products}
                categoryData={categoryData}
                slug={`offers/${slug}`}
            />
        </main>
    );
}
