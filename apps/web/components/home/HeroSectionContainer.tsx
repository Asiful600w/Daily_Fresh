import { getHeroSettings } from "@/lib/api";
import { HeroSection } from "@/components/home/HeroSection";

export async function HeroSectionContainer() {
    const heroSettings = await getHeroSettings();
    return <HeroSection settings={heroSettings} />;
}
