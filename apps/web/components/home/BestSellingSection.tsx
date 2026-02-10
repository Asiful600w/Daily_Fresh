import { ProductGrid } from "@/components/home/ProductGrid";
import { getBestSellingProducts } from "@/lib/api";

export async function BestSellingSection() {
    const bestSelling = await getBestSellingProducts();

    return (
        <ProductGrid
            products={bestSelling}
            title="Best Selling 🔥"
            subtitle="Most popular items this week"
        />
    );
}
