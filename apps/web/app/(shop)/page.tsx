import { Suspense } from "react";
import { CategoryScroller } from "@/components/home/CategoryScroller";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HeroSectionContainer } from "@/components/home/HeroSectionContainer";

import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { BestSellingSection } from "@/components/home/BestSellingSection";
import { PromotionalBannersSection } from "@/components/home/PromotionalBannersSection";
import { Footer } from "@/components/layout/Footer";
import { getCategories, getNotices, getAds, getHeroSettings } from "@/lib/api";
import { AdvertiseScroller } from "@/components/home/AdvertiseScroller";
import { NoticeScroller } from "@/components/home/NoticeScroller";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Home() {
  const [categories, heroSettings, rawNotices, rawAds] = await Promise.all([
    getCategories(),
    getHeroSettings(),
    getNotices(true),
    getAds(true)
  ]);

  const notices = rawNotices.map(n => n.text);
  const ads = rawAds.map(a => a.image_url);
  const showNoticeScroller = heroSettings.show_notice_scroller !== false;

  return (
    <>
      <AdvertiseScroller ads={ads} />
      {showNoticeScroller && <NoticeScroller notices={notices} />}

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Critical LCP Element - Rendered Immediately (Cached) */}
        <HeroSectionContainer />

        {/* Categories - Fast enough to block or stream? Let's render immediately as it's high up */}
        <CategoryScroller categories={categories} />

        {/* Streaming Sections */}
        <Suspense fallback={<ProductSectionSkeleton title="Best Selling 🔥" />}>
          <BestSellingSection />
        </Suspense>

        <Suspense fallback={<ProductSectionSkeleton title="Featured Products 🌟" />}>
          <FeaturedProductsSection />
        </Suspense>

        <Suspense fallback={<Skeleton className="w-full h-[300px] rounded-3xl" />}>
          <PromotionalBannersSection />
        </Suspense>

        <FeaturesSection />
      </main>
      <Footer categories={categories} />
    </>
  );
}

function ProductSectionSkeleton({ title }: { title: string }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
            {title}
          </h2>
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>
      <div className="flex gap-6 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="min-w-[200px] w-[200px] md:min-w-[240px] md:w-[240px]">
            <Skeleton className="aspect-[3/4] rounded-2xl w-full" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
