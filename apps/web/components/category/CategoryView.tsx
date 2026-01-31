'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product, Category } from '@/lib/api';
import { SidebarFilters } from './SidebarFilters';
import { ProductListing } from './ProductListing';

interface CategoryViewProps {
    products: Product[];
    categoryData: Category;
    slug: string;
}

export function CategoryView({ products, categoryData, slug }: CategoryViewProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // -- Derived Initial State --
    // Calculate global min/max price from the entire product list
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
    // Filter State
    const [priceRange, setPriceRange] = useState({ min: globalMinPrice, max: globalMaxPrice });
    // Reset price range if category changes
    useEffect(() => {
        if (priceRange.min !== globalMinPrice || priceRange.max !== globalMaxPrice) {
            setPriceRange({ min: globalMinPrice, max: globalMaxPrice });
        }
    }, [globalMinPrice, globalMaxPrice, priceRange.min, priceRange.max]);

    // Loading State
    const [isUpdating, setIsUpdating] = useState(false);

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
        // Immediate UI update for the numbers/slider
        setPriceRange({ min, max });
    };

    // Debounced URL/Filter update for Price to avoid crazy re-renders?
    // Actually, user wants "Instant Update".
    // "Dragging the slider will filter products instantly".
    // So we don't delay the filtering list, but maybe we delay the URL update or heavy animations?
    // Let's filter instantly. Effect is fast enough for <100 products.

    // -- Filtering & Sorting Logic --
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // 1. Filter by Subcategory (Client Side if needed, but usually Server handles it via URL?
        // Wait, current implementation passes `subcategory` via props to `CategoryPage` which filters via API.
        // But if we want instant switching, we should load ALL products for the category and filter locally?
        // The API `getProductsByCategory` fetches products matching the subcategory if provided.
        // If we want dynamic subcategory switching without reload, we need all products.
        // BUT `CategoryPage` fetches based on `searchParams.subcategory`.
        // If we change subcategory, we normally navigate.
        // For Filter System, "Attribute Filters" (Organic etc) are client side.
        // Subcategory is usually a navigation event.
        // Let's respect the `products` prop as the "Source of Truth" (which might already be filtered by subcategory).

        // 2. Filter by Price
        result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

        // 3. Sort
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
                    if (!a.createdAt) return 1;
                    if (!b.createdAt) return -1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                break;
        }

        return result;
    }, [products, currentSort, priceRange]);

    // -- Pagination Logic --
    const ITEMS_PER_PAGE = 12;
    const [currentPage, setCurrentPage] = useState(1);

    // Reset page when filters change
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [priceRange, currentSort, slug, currentPage]);

    const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filteredAndSortedProducts.slice(start, end);
    }, [filteredAndSortedProducts, currentPage]);

    const handlePageChange = (page: number) => {
        setIsUpdating(true);
        // Simulate network delay for smooth feel or just instant
        setTimeout(() => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsUpdating(false);
        }, 300);
    };

    // Helper to update URL silently
    const updateUrl = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => params.set(key, value));
        window.history.pushState(null, '', `?${params.toString()}`);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar Filters */}
            <SidebarFilters
                subcategories={categoryData.subcategories}
                currentCategory={slug}
                minPrice={globalMinPrice}
                maxPrice={globalMaxPrice}
                currentMin={priceRange.min}
                currentMax={priceRange.max}
                onPriceChange={handlePriceChange}
            />

            {/* Product Grid Area */}
            <ProductListing
                title={categoryData.name}
                products={paginatedProducts}
                totalProducts={filteredAndSortedProducts.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                currentSort={currentSort}
                onSortChange={handleSortChange}
                isUpdating={isUpdating}
            />
        </div>
    );
}
