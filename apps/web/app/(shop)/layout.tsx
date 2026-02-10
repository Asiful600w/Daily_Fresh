import { NavBar } from "@/components/layout/NavBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { getCategories } from "@/lib/api";

export const dynamic = 'force-dynamic';

export default async function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const categories = await getCategories();

    return (
        <>
            <GlobalSearch />
            <NavBar categories={categories} />
            <div className="pt-[120px] lg:pt-[130px] pb-24 md:pb-0">
                {children}
            </div>
            <MobileNav categories={categories} />
        </>
    );
}
