import { NavBar } from "@/components/layout/NavBar";
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
            <NavBar categories={categories} />
            <div className="pt-[120px] lg:pt-[130px]">
                {children}
            </div>
        </>
    );
}
