import { PromotionalBanners } from "@/components/home/PromotionalBanners";
import { getSpecialCategories } from "@/lib/api";

export async function PromotionalBannersSection() {
    const offers = await getSpecialCategories();
    return <PromotionalBanners offers={offers} />;
}
