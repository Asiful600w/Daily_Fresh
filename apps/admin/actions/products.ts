'use server'

import { getSupabaseService } from "@/lib/supabaseService";
import { revalidatePath } from "next/cache";

// Type definition for Product Payload (Subset of Product)
export type ProductPayload = {
    id?: number;
    name: string;
    price: number;
    originalPrice?: number;
    description: string;
    category: string;
    subcategory?: string;
    stockQuantity: number;
    quantity?: string; // unit label e.g., '1kg'
    images: string[];
    colors?: string[];
    sizes?: string[];
    discountPercent?: number;
    specialCategoryId?: number;
    merchantId?: string;
    shopName?: string;

    // SEO
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    noIndex?: boolean;
    ogImage?: string;
};

export async function upsertProductAction(product: ProductPayload) {
    const supabase = getSupabaseService();

    try {
        // 1. Resolve category name to ID
        let categoryId: number | null = null;
        if (product.category) {
            const { data: catData } = await supabase
                .from('categories')
                .select('id')
                .eq('name', product.category)
                .single();
            categoryId = catData?.id || null;
        }

        // 2. Resolve subcategory name to ID
        let subcategoryId: number | null = null;
        if (product.subcategory && categoryId) {
            const { data: subData } = await supabase
                .from('subcategories')
                .select('id')
                .eq('name', product.subcategory)
                .eq('category_id', categoryId)
                .single();
            subcategoryId = subData?.id || null;
        }

        // 3. Transform payload to snake_case for Supabase DB
        const dbPayload = {
            name: product.name,
            price: product.price,
            original_price: product.originalPrice,
            description: product.description,
            category: product.category, // Keep text for display
            subcategory: product.subcategory, // Keep text for display
            category_id: categoryId, // Add ID for relations
            subcategory_id: subcategoryId, // Add ID for relations
            stock_quantity: product.stockQuantity,
            quantity: product.quantity,
            images: product.images,
            colors: product.colors,
            sizes: product.sizes,
            discount_percent: product.discountPercent,
            special_category_id: product.specialCategoryId,
            merchant_id: product.merchantId,
            shop_name: product.shopName,
            meta_title: product.metaTitle,
            meta_description: product.metaDescription,
            keywords: product.keywords,
            canonical_url: product.canonicalUrl,
            no_index: product.noIndex,
            og_image: product.ogImage
        };

        console.log('DB Payload:', dbPayload);

        let result;
        if (product.id) {
            // Update
            console.log('Updating product with ID:', product.id);
            const { data, error } = await supabase
                .from('products')
                .update(dbPayload)
                .eq('id', product.id)
                .select();

            if (error) {
                console.error('Update error:', error);
                throw error;
            }

            result = Array.isArray(data) ? data[0] : data;
            console.log('Update result:', result);
        } else {
            // Create
            console.log('Creating new product');
            const createPayload = product.id ? { ...dbPayload, id: product.id } : dbPayload;

            const { data, error } = await supabase
                .from('products')
                .insert(createPayload)
                .select();

            if (error) {
                console.error('Insert error:', error);
                throw error;
            }

            result = Array.isArray(data) ? data[0] : data;
            console.log('Insert result:', result);
        }

        revalidatePath('/admin/products');
        revalidatePath('/shop');

        return { success: true, data: result };

    } catch (error: any) {
        console.error("upsertProductAction Error:", error);
        return { success: false, error: error.message || 'Unknown error occurred' };
    }
}

export async function toggleFeaturedProduct(productId: number, isFeatured: boolean) {
    const supabase = getSupabaseService();

    try {
        const { error } = await supabase
            .from('products')
            .update({ is_featured: isFeatured })
            .eq('id', productId);

        if (error) throw error;

        revalidatePath('/admin/products');
        revalidatePath('/');

        return { success: true };
    } catch (error: any) {
        console.error("toggleFeaturedProduct Error:", error);
        return { success: false, error: error.message || 'Unknown error occurred' };
    }
}
