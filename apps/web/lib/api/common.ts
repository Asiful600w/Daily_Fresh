import { createClient } from '@/lib/supabase/client';

export const supabase = createClient();

export interface Category {
    id: string;
    name: string;
    slug: string;
    img: string; // Icon/Slider Image
    banner?: string; // Hero Banner Image
    subcategories: { id?: string; name: string; count?: number }[];
}

export interface Product {
    id: number;
    name: string;
    category: string;
    subcategory?: string; // Mapped from subcategories.name
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    specialCategoryLabel?: string; // e.g. "Flash Deal"
    images: string[];
    description?: string;
    quantity?: string; // Display quantity e.g. "1kg"
    stockQuantity: number;
    colors: string[];
    sizes?: string[];
    createdAt: string; // ISO date string
    average_rating?: number;
    reviews_count?: number;
    shipping_inside_dhaka?: number;
    shipping_outside_dhaka?: number;
    vendor_name?: string;
    sold_count?: number;
    shop_name?: string;
    // SEO Fields
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    keywords?: string[];
    ogImage?: string;
    noIndex?: boolean;
}

export interface Address {
    id: string;
    label: string;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

export interface Notice {
    id: number;
    text: string;
    active: boolean;
}

export interface AdScroll {
    id: number;
    image_url: string;
    active: boolean;
}

// Helper to map DB result to app interface
export function mapCategory(row: any): Category {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        img: row.image_url,
        banner: row.banner_url || row.image_url, // Fallback to icon if banner missing
        // Filter out hidden categories if necessary, but this mapper is usually for valid categories
        subcategories: row.subcategories
            ? row.subcategories.map((s: any) => ({
                name: s.name,
                count: s.products ? s.products[0]?.count || 0 : 0
            }))
            : []
    };
}

export function mapProduct(row: any): Product {
    // V2: Pricing is already persistent in the DB.
    // 'price' is the current active price (discounted or regular).
    // 'original_price' is the previous price (if any).
    // 'discount_percent' is stored directly.

    return {
        id: row.id,
        name: row.name,
        category: row.categories?.name || 'Unknown',
        subcategory: row.subcategories?.name,
        price: row.price,
        originalPrice: row.original_price,
        discountPercent: row.discount_percent > 0 ? row.discount_percent : undefined,
        specialCategoryLabel: row.special_categories?.name,
        // Ensure images is an array and filter out empty strings/nulls
        images: Array.isArray(row.images) && row.images.length > 0
            ? row.images.filter((img: any) => img && typeof img === 'string' && img.trim() !== '')
            : row.image_url ? [row.image_url] : [],
        description: row.description,
        quantity: row.quantity_label,
        stockQuantity: row.stock_quantity || 0,
        colors: row.colors || [],
        sizes: row.sizes || [],
        createdAt: row.created_at,
        average_rating: row.average_rating,
        reviews_count: row.reviews_count,
        shipping_inside_dhaka: row.shipping_inside_dhaka,
        shipping_outside_dhaka: row.shipping_outside_dhaka,
        vendor_name: row.vendor_name,
        sold_count: row.sold_count || 0,
        shop_name: row.shop_name,
        // Map SEO fields
        metaTitle: row.meta_title,
        metaDescription: row.meta_description,
        canonicalUrl: row.canonical_url,
        keywords: row.keywords || [],
        ogImage: row.og_image,
        noIndex: row.no_index || false
    };
}

export function mapAddress(row: any): Address {
    return {
        id: row.id,
        label: row.label,
        fullName: row.full_name,
        phone: row.phone,
        street: row.street,
        city: row.city,
        state: row.state,
        postalCode: row.postal_code,
        country: row.country,
        isDefault: row.is_default
    };
}
