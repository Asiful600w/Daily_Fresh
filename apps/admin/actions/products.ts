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

    // Transform payload to snake_case for Supabase DB
    const dbPayload = {
        name: product.name,
        price: product.price,
        original_price: product.originalPrice,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        stock_quantity: product.stockQuantity,
        quantity: product.quantity, // This maps to 'quantity' column (unit label)
        images: product.images,
        colors: product.colors,
        sizes: product.sizes,
        discount_percent: product.discountPercent,
        special_category_id: product.specialCategoryId,
        merchant_id: product.merchantId,
        shop_name: product.shopName,
        meta_title: product.metaTitle,
        meta_description: product.metaDescription,
        keywords: product.keywords, // stored as text[]
        canonical_url: product.canonicalUrl,
        no_index: product.noIndex,
        og_image: product.ogImage
    };

    try {
        let result;
        if (product.id) {
            // Update
            const { data, error } = await supabase
                .from('products')
                .update(dbPayload)
                .eq('id', product.id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Create
            // Note: The ID might be auto-generated or passed. 
            // In ProductForm we generated a random ID. Better to let DB handle it or use the passed one if unique.
            // Adjusting payload to include ID if it's a manual insertion strategy, 
            // but usually 'id' is serial/identity. 
            // If ProductForm generates a high random ID, we can use it, but best practice is let DB do it.
            // For now, we honour the passed ID if provided, else let DB auto-inc (if set to serial).

            const createPayload = product.id ? { ...dbPayload, id: product.id } : dbPayload;

            const { data, error } = await supabase
                .from('products')
                .insert(createPayload)
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        revalidatePath('/admin/products');
        revalidatePath('/shop'); // Revalidate web shop if shared cache (unlikely here but good practice)

        return { success: true, data: result };

    } catch (error: any) {
        console.error("upsertProductAction Error:", error);
        return { success: false, error: error.message };
    }
}
