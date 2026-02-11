'use server'

import { getSupabaseService } from "@/lib/supabaseService";
import { createClient } from "@/lib/supabase/server";
import { validateProduct } from "@/lib/productValidation";
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

/**
 * Verify the caller is an authenticated admin (SUPERADMIN or MERCHANT).
 * Returns the user profile or throws.
 */
async function verifyAdminAuth() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error('Unauthorized: You must be logged in.');
    }

    // Fetch role from User table
    const serviceSupabase = getSupabaseService();
    const { data: profile, error: profileError } = await serviceSupabase
        .from('User')
        .select('id, role, name, shopName')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        throw new Error('Unauthorized: User profile not found.');
    }

    if (profile.role !== 'SUPERADMIN' && profile.role !== 'MERCHANT') {
        throw new Error('Forbidden: Only admins and merchants can manage products.');
    }

    return profile;
}

export async function upsertProductAction(product: ProductPayload) {
    try {
        // 1. AUTH GUARD — verify caller
        const caller = await verifyAdminAuth();

        // 2. FORCE correct merchantId based on role
        // Merchants can only create products under their own ID
        if (caller.role === 'MERCHANT') {
            product.merchantId = caller.id;
            product.shopName = caller.shopName || caller.name;
        }
        // SUPERADMINs can set any merchantId (or none)

        // 3. VALIDATE with Zod schema
        const validation = validateProduct(product);
        if (!validation.success) {
            return { success: false, error: `Validation failed: ${validation.error}` };
        }
        const validated = validation.data;

        // 4. Resolve category name to ID
        const supabase = getSupabaseService();

        let categoryId: number | null = null;
        if (validated.category) {
            const { data: catData } = await supabase
                .from('categories')
                .select('id')
                .eq('name', validated.category)
                .single();
            categoryId = catData?.id || null;
        }

        // 5. Resolve subcategory name to ID
        let subcategoryId: number | null = null;
        if (validated.subcategory && categoryId) {
            const { data: subData } = await supabase
                .from('subcategories')
                .select('id')
                .eq('name', validated.subcategory)
                .eq('category_id', categoryId)
                .single();
            subcategoryId = subData?.id || null;
        }

        // 6. Transform payload to snake_case for Supabase DB
        const dbPayload = {
            name: validated.name,
            price: validated.price,
            original_price: validated.originalPrice,
            description: validated.description,
            category: validated.category,
            subcategory: validated.subcategory,
            category_id: categoryId,
            subcategory_id: subcategoryId,
            stock_quantity: validated.stockQuantity,
            quantity: validated.quantity,
            images: validated.images,
            colors: validated.colors,
            sizes: validated.sizes,
            discount_percent: validated.discountPercent,
            special_category_id: validated.specialCategoryId,
            merchant_id: validated.merchantId,
            shop_name: validated.shopName,
            meta_title: validated.metaTitle,
            meta_description: validated.metaDescription,
            keywords: validated.keywords,
            canonical_url: validated.canonicalUrl,
            no_index: validated.noIndex,
            og_image: validated.ogImage
        };

        let result;
        if (validated.id) {
            // Update — merchants can only update their own products
            const updateQuery = supabase
                .from('products')
                .update(dbPayload)
                .eq('id', validated.id);

            // Scope to merchant's own products
            if (caller.role === 'MERCHANT') {
                updateQuery.eq('merchant_id', caller.id);
            }

            const { data, error } = await updateQuery.select();

            if (error) throw error;
            result = Array.isArray(data) ? data[0] : data;
        } else {
            // Create
            const { data, error } = await supabase
                .from('products')
                .insert(dbPayload)
                .select();

            if (error) throw error;
            result = Array.isArray(data) ? data[0] : data;
        }

        revalidatePath('/admin/products');
        revalidatePath('/shop');

        return { success: true, data: result };

    } catch (error: any) {
        console.error("upsertProductAction Error:", error?.message);
        return { success: false, error: error.message || 'Unknown error occurred' };
    }
}

export async function toggleFeaturedProduct(productId: number, isFeatured: boolean) {
    try {
        // Auth guard
        await verifyAdminAuth();

        const supabase = getSupabaseService();
        const { error } = await supabase
            .from('products')
            .update({ is_featured: isFeatured })
            .eq('id', productId);

        if (error) throw error;

        revalidatePath('/admin/products');
        revalidatePath('/');

        return { success: true };
    } catch (error: any) {
        console.error("toggleFeaturedProduct Error:", error?.message);
        return { success: false, error: error.message || 'Unknown error occurred' };
    }
}
