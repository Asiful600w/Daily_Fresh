import { ProductGrid } from "@/components/home/ProductGrid";
import { getFeaturedProducts } from "@/lib/api";

export async function FeaturedProductsSection() {
    const featured = await getFeaturedProducts();

    return (
        <ProductGrid
            products={featured}
            title="Featured Products 🌟"
            subtitle="Handpicked selection just for you"
        />
    );
}
