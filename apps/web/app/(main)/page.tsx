import { CategoryScroller } from "@/components/home/CategoryScroller";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { ProductGrid } from "@/components/home/ProductGrid";
import { PromotionalBanners } from "@/components/home/PromotionalBanners";
import { Footer } from "@/components/layout/Footer";
import { getCategories, getFeaturedProducts, getBestSellingProducts, getSpecialCategories, getHeroSettings, getNotices, getAds } from "@/lib/api";
import { AdvertiseScroller } from "@/components/home/AdvertiseScroller";
import { NoticeScroller } from "@/components/home/NoticeScroller";

export default async function Home() {
  const categories = await getCategories();
  const featured = await getFeaturedProducts();
  const bestSelling = await getBestSellingProducts();
  const offers = await getSpecialCategories();
  const heroSettings = await getHeroSettings();
  const rawNotices = await getNotices(true);
  const notices = rawNotices.map(n => n.text);
  const rawAds = await getAds(true);
  const ads = rawAds.map(a => a.image_url);

  // Check if notice scroller should be shown (default to true if field doesn't exist)
  const showNoticeScroller = heroSettings.show_notice_scroller !== false;

  return (
    <>
      <AdvertiseScroller ads={ads} />
      {showNoticeScroller && <NoticeScroller notices={notices} />}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <HeroSection settings={heroSettings} />
        <CategoryScroller categories={categories} />

        {/* Best Selling Section */}
        <ProductGrid
          products={bestSelling}
          title="Best Selling 🔥"
          subtitle="Most popular items this week"
        />

        {/* Featured Section */}
        <ProductGrid
          products={featured}
          title="Featured Products 🌟"
          subtitle="Handpicked selection just for you"
        />
        <PromotionalBanners offers={offers} />
        <FeaturesSection />
      </main>
      <Footer categories={categories} />
    </>
  );
}
