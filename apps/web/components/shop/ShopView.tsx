'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product, Category } from '@/lib/api';
import { ProductListing } from '@/components/category/ProductListing';
import { MobileFilterBar } from '@/components/category/MobileFilterBar';
import { SidebarShopFilters } from './SidebarShopFilters';
import { MobileShopFilterDrawer } from './MobileShopFilterDrawer';

interface ShopViewProps {
    products: Product[];
    categories: Category[];
}

export function ShopView({ products, categories }: ShopViewProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // -- Derived Initial State --
    const globalMinPrice = useMemo(() => {
        if (products.length === 0) return 0;
        return Math.floor(Math.min(...products.map(p => p.price)));
    }, [products]);

    const globalMaxPrice = useMemo(() => {
        if (products.length === 0) return 1000;
        return Math.ceil(Math.max(...products.map(p => p.price)));
    }, [products]);

    // -- State --
    const [currentSort, setCurrentSort] = useState(searchParams.get('sort') || 'newest');
    // Initialize price range directly from computed globals
    const [priceRange, setPriceRange] = useState({ min: globalMinPrice, max: globalMaxPrice });

    // Category State (URL Sync)
    // We treat URL as source of truth for Category/Subcategory to allow sharing links
    const selectedCategorySlug = searchParams.get('category') || undefined;
    const selectedSubcategoryName = searchParams.get('subcategory') || undefined;

    const [isUpdating, setIsUpdating] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // -- Handlers --
    const handleSortChange = (sort: string) => {
        setIsUpdating(true);
        setTimeout(() => {
            setCurrentSort(sort);
            updateUrl({ sort });
            setIsUpdating(false);
        }, 500);
    };

    const handlePriceChange = (min: number, max: number) => {
        setPriceRange({ min, max });
    };

    const handleCategoryChange = (categorySlug: string | undefined, subcategoryName?: string) => {
        // Reset pagination
        setCurrentPage(1);
        setIsUpdating(true);

        setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (categorySlug) {
                params.set('category', categorySlug);
            } else {
                params.delete('category');
            }

            if (subcategoryName) {
                params.set('subcategory', subcategoryName);
            } else {
                params.delete('subcategory');
            }

            // Clean up sort if default
            if (currentSort === 'newest') params.delete('sort');
            else params.set('sort', currentSort);

            router.push(`/shop?${params.toString()}`, { scroll: false });
            setIsUpdating(false);
            setIsMobileFiltersOpen(false);
        }, 300);
    };

    const handlePageChange = (page: number) => {
        setIsUpdating(true);
        setTimeout(() => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsUpdating(false);
        }, 300);
    };

    const updateUrl = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => params.set(key, value));
        window.history.pushState(null, '', `?${params.toString()}`);
    };

    // -- Filtering & Sorting Logic --
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // 1. Filter by Category
        if (selectedCategorySlug) {
            // Find category name from slug
            const catInfo = categories.find(c => c.slug === selectedCategorySlug);
            if (catInfo) {
                result = result.filter(p => p.category === catInfo.name);
            }
        }

        // 2. Filter by Subcategory
        if (selectedSubcategoryName) {
            // Need to know which field holds subcategory. API usually returns 'subcategory' or we check tags?
            // Checking `Product` interface in `lib/api.ts` (assumed).
            // Usually products have `subcategory`. If not, we might need adjustments.
            // Assumption: Product has `subcategory` field matching the name.
            result = result.filter(p => p.subcategory === selectedSubcategoryName);
        }

        // 3. Filter by Price
        result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

        // 4. Sort
        switch (currentSort) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'best-selling':
                result.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));
                break;
            case 'newest':
                result.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                });
                break;
        }

        return result;
    }, [products, categories, selectedCategorySlug, selectedSubcategoryName, priceRange, currentSort]);

    // -- Pagination --
    const ITEMS_PER_PAGE = 12;
    const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filteredAndSortedProducts.slice(start, end);
    }, [filteredAndSortedProducts, currentPage]);

    return (
        <div className="flex flex-col lg:flex-row gap-12 relative pb-32 lg:pb-0">
            {/* Mobile Sticky Header */}
            <div className="lg:hidden sticky top-[56px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800 transition-all duration-300">
                <MobileFilterBar
                    totalResults={filteredAndSortedProducts.length}
                    onFilterClick={() => setIsMobileFiltersOpen(true)}
                    currentSort={currentSort}
                    onSortChange={handleSortChange}
                />
                {/* Active Filters Display (Mobile) */}
                {(selectedCategorySlug || selectedSubcategoryName) && (
                    <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto hide-scrollbar">
                        {selectedCategorySlug && (
                            <span className="flex-shrink-0 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                {categories.find(c => c.slug === selectedCategorySlug)?.name}
                                <button onClick={() => handleCategoryChange(undefined)} className="hover:text-red-500"><span className="material-icons-round text-sm">close</span></button>
                            </span>
                        )}
                        {selectedSubcategoryName && (
                            <span className="flex-shrink-0 px-3 py-1 bg-primary/10 rounded-full text-xs font-bold text-primary flex items-center gap-1">
                                {selectedSubcategoryName}
                                <button onClick={() => handleCategoryChange(selectedCategorySlug, undefined)} className="hover:text-red-500"><span className="material-icons-round text-sm">close</span></button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            <MobileShopFilterDrawer
                isOpen={isMobileFiltersOpen}
                onClose={() => setIsMobileFiltersOpen(false)}
                categories={categories}
                selectedCategory={selectedCategorySlug}
                selectedSubcategory={selectedSubcategoryName}
                onCategoryChange={handleCategoryChange}
                minPrice={globalMinPrice}
                maxPrice={globalMaxPrice}
                currentMin={priceRange.min}
                currentMax={priceRange.max}
                onPriceChange={handlePriceChange}
            />

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-72 flex-shrink-0">
                <SidebarShopFilters
                    categories={categories}
                    selectedCategory={selectedCategorySlug}
                    selectedSubcategory={selectedSubcategoryName}
                    onCategoryChange={handleCategoryChange}
                    minPrice={globalMinPrice}
                    maxPrice={globalMaxPrice}
                    currentMin={priceRange.min}
                    currentMax={priceRange.max}
                    onPriceChange={handlePriceChange}
                />
            </div>

            {/* Product Grid */}
            <div className="flex-1">
                <ProductListing
                    title={
                        selectedSubcategoryName
                            ? selectedSubcategoryName
                            : selectedCategorySlug
                                ? categories.find(c => c.slug === selectedCategorySlug)?.name || 'Products'
                                : 'All Products'
                    }
                    subtitle={`Showing ${filteredAndSortedProducts.length} results`}
                    products={paginatedProducts}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    currentSort={currentSort}
                    onSortChange={handleSortChange}
                    isUpdating={isUpdating}
                />
            </div>
        </div>
    );
}
