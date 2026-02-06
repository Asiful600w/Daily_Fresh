
'use server'

import { supabaseAdmin as supabase } from './supabaseAdmin';

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
    merchant_id?: string;
    is_approved?: boolean;
    shop_name?: string;
    // SEO Fields
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    keywords?: string[];
    ogImage?: string;
    noIndex?: boolean;
}

// Helper to map DB result to app interface
function mapCategory(row: any): Category {
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

function mapProduct(row: any): Product {
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
        images: Array.isArray(row.images) ? row.images.filter((img: any) => img && typeof img === 'string' && img.trim() !== '') : [],
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
        merchant_id: row.merchant_id,
        is_approved: row.is_approved,
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

export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select(`
            id, name, slug, image_url, banner_url, is_hidden,
            subcategories (
                name,
                products:products(count)
            )
        `)

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data.map(mapCategory);
}

export async function getCategory(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
        .from('categories')
        .select(`
            id, name, slug, image_url, banner_url, is_hidden,
            subcategories (
                name,
                products:products(count)
            )
        `)
        .eq('slug', slug)
        .single();

    if (error) {
        console.error(`Error fetching category ${slug}:`, error);
        return null;
    }

    return mapCategory(data);
}

export async function getCategoryById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
        .from('categories')
        .select(`
            id, name, slug, image_url, banner_url, is_hidden,
            subcategories ( id, name )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching category ${id}:`, error);
        return null;
    }

    return {
        ...mapCategory(data),
        subcategories: data.subcategories // Keep IDs for editing
    };
}

export async function createCategory(category: { name: string; slug: string; image_url: string; banner_url?: string; subcategories?: string[] }) {
    // 1. Insert Category
    const { data: newCat, error } = await supabase
        .from('categories')
        .insert({
            name: category.name,
            slug: category.slug,
            image_url: category.image_url,
            banner_url: category.banner_url
        })
        .select()
        .single();

    if (error) throw error;

    // 2. Insert Subcategories
    if (category.subcategories && category.subcategories.length > 0) {
        const subs = category.subcategories.map(name => ({
            category_id: newCat.id,
            name
        }));
        const { error: subError } = await supabase.from('subcategories').insert(subs);
        if (subError) throw subError;
    }
}

export async function updateCategory(id: string, category: { name: string; slug: string; image_url: string; banner_url?: string; subcategories?: { id?: string; name: string }[] }) {
    // 1. Update Category
    const { error } = await supabase
        .from('categories')
        .update({
            name: category.name,
            slug: category.slug,
            image_url: category.image_url,
            banner_url: category.banner_url
        })
        .eq('id', id);

    if (error) throw error;

    // 2. Manage Subcategories (Simple Replace or Diff?)
    // Simple approach: Delete all and re-insert is risky for product FKs.
    // Better: Upsert explicit IDs, insert new ones, delete missing?
    // For this demo, we'll just insert new ones and update existing names. Deletion is tricky if products depend on them.
    // Let's just Insert new ones for now and Update existing.
    if (category.subcategories) {
        for (const sub of category.subcategories) {
            if (sub.id) {
                await supabase.from('subcategories').update({ name: sub.name }).eq('id', sub.id);
            } else {
                await supabase.from('subcategories').insert({ category_id: id, name: sub.name });
            }
        }
    }
}

export async function deleteCategory(id: string) {
    // Check for products in this category first
    const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

    if (countError) {
        console.error('Error checking products:', countError);
        throw new Error('Failed to verify category products.');
    }

    if (count !== null && count > 0) {
        throw new Error(`Cannot delete category. It contains ${count} products. Please remove/move them first.`);
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
}

export async function getCategoryProducts(categoryId: string) {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity, image_url')
        .eq('category_id', categoryId)
        .eq('is_deleted', false);

    if (error) {
        console.error('Error fetching category products:', error);
        return [];
    }
    return data.map(p => ({ ...p, image: p.image_url }));
}



export async function deleteSubcategory(id: string) {
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) throw error;
}

export async function getCustomers(phoneQuery?: string) {
    let query = supabase
        .from('profiles')
        .select('*');

    if (phoneQuery) {
        query = query.ilike('phone', `%${phoneQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
    return data;
}

export async function getCustomerById(id: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching customer ${id}:`, error);
        return null;
    }
    return data;
}



export async function getSalesAnalytics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .eq('status', 'delivered')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching sales analytics:', error);
        return [];
    }

    // Group by Date
    const salesMap = new Map<string, number>();

    // Initialize last 30 days with 0
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        salesMap.set(d.toLocaleDateString('en-US'), 0);
    }

    orders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-US');
        const current = salesMap.get(date) || 0;
        salesMap.set(date, current + order.total_amount);
    });

    return Array.from(salesMap.entries())
        .map(([date, sales]) => ({ name: date.split('/')[0] + '/' + date.split('/')[1], sales, fullDate: date }))
        .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
}

export async function getCategoryStats() {
    try {
        // Try to fetch from view first (if user ran the SQL)
        const { data: viewData, error: viewError } = await supabase
            .from('category_stats')
            .select('*')
            .order('total_items_sold', { ascending: false });

        if (!viewError && viewData) {
            const total = viewData.reduce((sum, item) => sum + item.total_items_sold, 0);
            return viewData.map((item: any) => ({
                name: item.category,
                count: item.total_items_sold,
                percentage: total > 0 ? Math.round((item.total_items_sold / total) * 100) : 0
            }));
        }

        // Fallback: Client-side aggregation
        const { data, error } = await supabase
            .from('order_items')
            .select('category, quantity');

        if (error) throw error;

        const stats = new Map<string, number>();
        let totalItems = 0;

        data.forEach((item: any) => {
            if (item.category) {
                const current = stats.get(item.category) || 0;
                stats.set(item.category, current + item.quantity);
                totalItems += item.quantity;
            }
        });

        return Array.from(stats.entries())
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count);

    } catch (error) {
        console.error('Error fetching category stats:', error);
        return [];
    }
}

export async function getSpecialCategories(): Promise<{ id: number; name: string; description?: string; image_url?: string }[]> {
    const { data, error } = await supabase
        .from('special_categories')
        .select('id, name, description, image_url')
        .eq('active', true);

    if (error) {
        console.error('Error fetching special categories:', error);
        return [];
    }
    return data;
}

export async function searchProducts(query: string): Promise<Product[]> {
    if (!query) return [];

    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories (name),
            special_categories (name)
        `)
        .eq('is_deleted', false) // Soft delete filter
        .ilike('name', `%${query}%`)
        .limit(5);

    if (error) {
        console.error('Error searching products:', error);
        return [];
    }

    return data.map(mapProduct);
}

export async function createSpecialCategory(name: string, description?: string, imageUrl?: string) {
    const { error } = await supabase
        .from('special_categories')
        .insert({ name, description, image_url: imageUrl });

    if (error) {
        console.error('Error creating special category:', error);
        throw error;
    }
}

export async function deleteSpecialCategory(id: number) {
    const { error } = await supabase
        .from('special_categories')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting special category:', error);
        throw error;
    }
}

export interface ProductFilterOptions {
    query?: string;
    categoryId?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc' | 'newest';
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    merchantId?: string;
}

export interface PaginatedProducts {
    data: Product[];
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export async function getProducts(options?: ProductFilterOptions | string): Promise<Product[]> {
    const filter = typeof options === 'string' ? { query: options } : (options || {});

    let query = supabase
        .from('products')
        .select(`
            *,
            categories (name),
            special_categories (name)
        `)
        .eq('is_deleted', false);

    if (filter.query) {
        query = query.ilike('name', `%${filter.query}%`);
    }

    if (filter.categoryId) {
        query = query.eq('category_id', filter.categoryId);
    }

    if (filter.merchantId) {
        query = query.eq('merchant_id', filter.merchantId);
    }

    if (filter.minPrice !== undefined) {
        query = query.gte('price', filter.minPrice);
    }

    if (filter.maxPrice !== undefined) {
        query = query.lte('price', filter.maxPrice);
    }

    if (filter.sortBy) {
        switch (filter.sortBy) {
            case 'price_asc': query = query.order('price', { ascending: true }); break;
            case 'price_desc': query = query.order('price', { ascending: false }); break;
            case 'stock_asc': query = query.order('stock_quantity', { ascending: true }); break;
            case 'stock_desc': query = query.order('stock_quantity', { ascending: false }); break;
            case 'newest': query = query.order('created_at', { ascending: false }); break;
            default: query = query.order('id', { ascending: true });
        }
    } else {
        query = query.order('id', { ascending: true });
    }

    // No pagination here to maintain backward compatibility

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data.map(mapProduct);
}

export async function getProductsPaginated(options: ProductFilterOptions): Promise<PaginatedProducts> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('products')
        .select(`
            *,
            categories (name),
            special_categories (name)
        `, { count: 'exact' })
        .eq('is_deleted', false);

    if (options.query) {
        query = query.ilike('name', `%${options.query}%`);
    }

    if (options.categoryId) {
        query = query.eq('category_id', options.categoryId);
    }

    if (options.merchantId) {
        query = query.eq('merchant_id', options.merchantId);
    }

    if (options.minPrice !== undefined) {
        query = query.gte('price', options.minPrice);
    }

    if (options.maxPrice !== undefined) {
        query = query.lte('price', options.maxPrice);
    }

    // Apply Sorting
    if (options.sortBy) {
        switch (options.sortBy) {
            case 'price_asc': query = query.order('price', { ascending: true }); break;
            case 'price_desc': query = query.order('price', { ascending: false }); break;
            case 'stock_asc': query = query.order('stock_quantity', { ascending: true }); break;
            case 'stock_desc': query = query.order('stock_quantity', { ascending: false }); break;
            case 'newest': query = query.order('created_at', { ascending: false }); break;
            default: query = query.order('id', { ascending: true });
        }
    } else {
        query = query.order('id', { ascending: true });
    }

    // Apply Pagination
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
        console.error('Error fetching paginated products:', error);
        return { data: [], count: 0, page, pageSize: limit, totalPages: 0 };
    }

    return {
        data: (data || []).map(mapProduct),
        count: count || 0,
        page,
        pageSize: limit,
        totalPages: count ? Math.ceil(count / limit) : 0
    };
}

export async function getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories (name),
            subcategories (name),
            special_categories (name)
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }

    return mapProduct(data);
}

// Sort options type (removed popularity)
export type SortOption = 'price-asc' | 'price-desc' | 'newest';

// Debug mode: Simplified query
export async function getProductsByCategory(slug: string, subcategory?: string, sort?: any): Promise<Product[]> {
    let query = supabase
        .from('products')
        .select(`
            *,
            categories!inner (name, slug),
            subcategories (name),
            special_categories (name)
        `)
        .eq('is_deleted', false) // Soft delete filter
        .eq('categories.slug', slug);

    if (subcategory) {
        query = supabase
            .from('products')
            .select(`
                *,
                categories!inner (name, slug),
                subcategories!inner (name),
                special_categories (name)
            `)
            .eq('is_deleted', false) // Soft delete filter
            .eq('categories.slug', slug)
            .eq('subcategories.name', subcategory);
    }

    // Sorting
    if (sort) {
        switch (sort) {
            case 'price-asc':
                query = query.order('price', { ascending: true });
                break;
            case 'price-desc':
                query = query.order('price', { ascending: false });
                break;
            case 'newest':
                query = query.order('created_at', { ascending: false });
                break;
            default:
                // Default to id
                query = query.order('id', { ascending: true });
        }
    } else {
        // Default sort
        query = query.order('id', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
        console.error(`Error fetching products for category ${slug}:`, error);
        return [];
    }

    return data.map(mapProduct);
}

// Fetch products by Special Category Name
export async function getProductsBySpecialCategory(specialCategoryName: string, sort?: string): Promise<Product[]> {
    const { data: specialCat } = await supabase.from('special_categories').select('id').eq('name', specialCategoryName).single();
    if (!specialCat) return [];

    let query = supabase
        .from('products')
        .select(`
            *,
            categories (name, slug),
            special_categories (name)
        `)
        .eq('is_deleted', false)
        .eq('special_category_id', specialCat.id);

    // Reuse sort logic
    if (sort) {
        switch (sort) {
            case 'price-asc': query = query.order('price', { ascending: true }); break;
            case 'price-desc': query = query.order('price', { ascending: false }); break;
            case 'newest': query = query.order('created_at', { ascending: false }); break;
            default: query = query.order('id', { ascending: true });
        }
    }

    const { data, error } = await query;

    if (error) {
        console.error(`Error fetching products for offer ${specialCategoryName}:`, error);
        return [];
    }

    return data.map(mapProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
    // Just return some products for now
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories (name),
            special_categories (name)
        `)
        .eq('is_deleted', false)
        .limit(8);

    if (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }

    return data.map(mapProduct);
}

export async function getBestSellingProducts(limit: number = 8): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories (name),
            special_categories (name)
        `)
        .eq('is_deleted', false)
        .order('sold_count', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching best selling products:', error);
        return [];
    }

    return data.map(mapProduct);
}

export async function getRelatedProducts(productId: string | number, limit: number = 4): Promise<Product[]> {
    // 1. Get current product's category to find related items
    const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('category_id, subcategory_id')
        .eq('id', productId)
        .single();

    if (fetchError || !currentProduct) {
        return [];
    }

    // 2. Fetch products in same category, preferably same subcategory
    let query = supabase
        .from('products')
        .select(`
            *,
            categories (name),
            special_categories (name)
        `)
        .eq('is_deleted', false)
        .eq('category_id', currentProduct.category_id)
        .neq('id', productId) // Exclude self
        .limit(limit);

    // Optional: Sort by sold_count or random? keeping it simple for now (default ID sort or random?)
    // To make it slightly dynamic/interesting, maybe sort by random if possible? 
    // Supabase random sort is tricky. Let's just sort by sold_count desc to show best related items.
    query = query.order('sold_count', { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching related products:', error);
        return [];
    }

    return data.map(mapProduct);
}

export async function createProduct(product: Partial<Product> & { specialCategoryId?: number; merchantId?: string; shopName?: string }) {
    // 1. Get Category ID
    const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('name', product.category)
        .single();

    if (!category) throw new Error(`Category ${product.category} not found`);

    // 2. Get Subcategory ID (if applicable)
    let subcategoryId = null;
    if (product.subcategory) {
        const { data: sub } = await supabase
            .from('subcategories')
            .select('id')
            .eq('name', product.subcategory)
            .eq('category_id', category.id)
            .single();
        if (sub) subcategoryId = sub.id;
    }

    // 3. Prepare Data
    // Use provided ID or generate
    const newId = product.id || Math.floor(Math.random() * 90000000) + 10000000;

    const productData: any = {
        id: newId,
        name: product.name,
        price: product.price,
        original_price: product.originalPrice,
        discount_percent: product.discountPercent || 0,
        description: product.description,
        category_id: category.id,
        subcategory_id: subcategoryId,
        quantity_label: product.quantity,
        stock_quantity: product.stockQuantity,
        images: product.images || [], // Use images array
        colors: product.colors,
        sizes: product.sizes,
        special_category_id: product.specialCategoryId,
        merchant_id: product.merchantId,
        shop_name: product.shopName,
        is_approved: product.merchantId ? false : true, // SuperAdmin (no merchantId passed by default?) -> true, Merchant -> false

        // SEO Fields
        meta_title: product.metaTitle,
        meta_description: product.metaDescription,
        canonical_url: product.canonicalUrl,
        keywords: product.keywords,
        no_index: product.noIndex,
        og_image: product.ogImage
    };

    const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

    if (error) {
        console.error('Error creating product:', error);
        throw error;
    }
    return mapProduct(data);
}

export async function updateProduct(id: number, product: Partial<Product> & { specialCategoryId?: number; merchantId?: string; shopName?: string; isApproved?: boolean }) {
    // 1. Resolve Category/Subcategory IDs if names generated
    let categoryId = undefined;
    if (product.category) {
        const { data: cat } = await supabase.from('categories').select('id').eq('name', product.category).single();
        if (cat) categoryId = cat.id;
    }

    let subcategoryId = undefined;
    if (product.subcategory && categoryId) {
        const { data: sub } = await supabase.from('subcategories').select('id').eq('name', product.subcategory).eq('category_id', categoryId).single();
        if (sub) subcategoryId = sub.id;
    }

    // 2. Prepare Payload
    const updates: any = {};
    if (product.name) updates.name = product.name;
    if (product.price !== undefined) updates.price = product.price;
    if (product.originalPrice !== undefined) updates.original_price = product.originalPrice;
    if (product.discountPercent !== undefined) updates.discount_percent = product.discountPercent;
    if (product.description) updates.description = product.description;

    // Category updates
    if (categoryId) updates.category_id = categoryId;
    if (subcategoryId !== undefined) updates.subcategory_id = subcategoryId;

    if (product.quantity) updates.quantity_label = product.quantity;
    if (product.stockQuantity !== undefined) updates.stock_quantity = product.stockQuantity;
    if (product.images) updates.images = product.images;
    if (product.colors) updates.colors = product.colors;
    if (product.sizes) updates.sizes = product.sizes;
    if (product.specialCategoryId !== undefined) updates.special_category_id = product.specialCategoryId;

    // SEO updates
    if (product.metaTitle !== undefined) updates.meta_title = product.metaTitle;
    if (product.metaDescription !== undefined) updates.meta_description = product.metaDescription;
    if (product.canonicalUrl !== undefined) updates.canonical_url = product.canonicalUrl;
    if (product.keywords !== undefined) updates.keywords = product.keywords;
    if (product.noIndex !== undefined) updates.no_index = product.noIndex;
    if (product.ogImage !== undefined) updates.og_image = product.ogImage;

    // Merchant fields
    if (product.merchantId !== undefined) updates.merchant_id = product.merchantId;
    if (product.shopName !== undefined) updates.shop_name = product.shopName;
    if (product.isApproved !== undefined) updates.is_approved = product.isApproved;

    const { data: updatedData, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating product:', error);
        throw error;
    }
    return mapProduct(updatedData);
}

// Soft Delete Product
export async function deleteProduct(id: number | string) {
    const { error } = await supabase
        .from('products')
        .update({
            is_deleted: true,
            deleted_at: new Date()
        })
        .eq('id', id);

    if (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

export async function createOrder(
    userId: string,
    totalAmount: number,
    items: any[],
    shippingDetails: {
        name: string;
        phone: string;
        address: string;
    },
    paymentMethod: string = 'cod'
) {
    // 1. Create Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: userId,
            total_amount: totalAmount,
            status: 'pending',
            shipping_name: shippingDetails.name,
            shipping_phone: shippingDetails.phone,
            shipping_address: shippingDetails.address,

            payment_method: paymentMethod,
            payment_status: 'pending'
        })
        .select()
        .single();

    if (orderError) throw orderError;

    // 2. Create Order Items
    const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.images && item.images.length > 0 ? item.images[0] : (item.image || ''),
        category: item.category,
        size: item.size,
        color: item.color
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3. Clear Cart (Backend side)
    const { data: cart } = await supabase.from('carts').select('id').eq('user_id', userId).single();
    if (cart) {
        await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    }

    // 4. Update Stock Logic
    try {
        for (const item of items) {
            // Fetch latest stock to ensure accuracy
            const { data: product, error: fetchError } = await supabase
                .from('products')
                .select('stock_quantity')
                .eq('id', item.id)
                .single();

            if (product && !fetchError) {
                const newStock = Math.max(0, product.stock_quantity - item.quantity);
                await supabase
                    .from('products')
                    .update({ stock_quantity: newStock })
                    .eq('id', item.id);
            }
        }
    } catch (error) {
        console.error('Error updating stock:', error);
        // We don't throw here to avoid failing the order if stock update fails,
        // but in a production app you might want to handle this differently.
    }

    return order;
}

export async function getOrder(id: string) {
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            *,
            items:order_items(
                *,
                products (images)
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching order:', error);
        return null;
    }

    // Fetch profile for dynamic customer info
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('id', order.user_id)
        .single();

    const customerName = profile?.full_name || order.shipping_name || 'Guest';
    const customerPhone = profile?.phone || order.shipping_phone || '';

    return {
        ...order,
        customer: {
            name: customerName,
            phone: customerPhone,
            avatar: profile?.avatar_url,
            id: order.user_id
        }
    };
}

export async function getUserOrders(userId: string) {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (id)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user orders:', error);
        return [];
    }

    return data.map(order => ({
        ...order,
        item_count: order.order_items.length
    }));
}

export async function getAllOrders(searchQuery?: string) {
    let query = supabase
        .from('orders')
        .select(`
            *,
            order_items (id, name, quantity, size, color)
        `)
        .order('created_at', { ascending: false });

    if (searchQuery) {
        query = query.or(`id.ilike.%${searchQuery}%,shipping_name.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching all orders:', error);
        return [];
    }

    // Fetch profiles for these users to show dynamic names
    const userIds = Array.from(new Set((data || []).map(o => o.user_id)));
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url')
        .in('id', userIds);

    return (data || []).map(order => {
        const profile = profiles?.find(p => p.id === order.user_id);
        const customerName = profile?.full_name || order.shipping_name || 'Guest';
        const customerPhone = profile?.phone || order.shipping_phone || '';

        return {
            ...order,
            item_count: order.order_items ? order.order_items.length : 0,
            items_summary: order.order_items ? order.order_items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ') : '',
            customer: {
                name: customerName,
                phone: customerPhone,
                avatar: profile?.avatar_url,
                id: order.user_id
            }
        };
    });
}

export async function getLowStockProducts() {
    const { data, error } = await supabase
        .from('products')
        .select(`
            id, name, stock_quantity, price, images,
            categories (name)
        `)
        .lt('stock_quantity', 10);

    if (error) {
        console.error('Error fetching low stock products:', error);
        return [];
    }
    // Map to consistently use 'image' if needed
    return data.map((p: any) => ({
        ...p,
        image: p.images && p.images.length > 0 ? p.images[0] : '',
        category: p.categories?.name || (Array.isArray(p.categories) ? p.categories[0]?.name : 'Unknown')
    }));
}

export async function updateOrderStatus(id: string, status: string) {
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

    if (error) throw error;
}

// Address Management

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

function mapAddress(row: any): Address {
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

export async function getUserAddresses(userId: string): Promise<Address[]> {
    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false }) // Default first
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching addresses:', error);
        return [];
    }

    return data.map(mapAddress);
}

export async function saveAddress(userId: string, address: Partial<Address>) {
    // If editing, address should have ID
    if (address.id) {
        const { error } = await supabase
            .from('addresses')
            .update({
                label: address.label,
                full_name: address.fullName,
                phone: address.phone,
                street: address.street,
                city: address.city,
                state: address.state,
                postal_code: address.postalCode,
                country: address.country,
                is_default: address.isDefault
            })
            .eq('id', address.id)
            .eq('user_id', userId); // Security check

        if (error) throw error;
    } else {
        // Creating new
        const { error } = await supabase
            .from('addresses')
            .insert({
                user_id: userId,
                label: address.label,
                full_name: address.fullName,
                phone: address.phone,
                street: address.street,
                city: address.city,
                state: address.state,
                postal_code: address.postalCode,
                country: address.country,
                is_default: address.isDefault
            });

        if (error) throw error;
    }
}

// Review Eligibility
export async function checkReviewEligibility(userId: string, productId: string | number): Promise<boolean> {
    // 1. Check if user ordered the product and it's delivered
    const { data: eligibleOrders, error } = await supabase
        .from('orders')
        .select(`
            id,
            status,
            order_items!inner(product_id)
        `)
        .eq('user_id', userId)
        .eq('status', 'delivered')
        .eq('order_items.product_id', productId)
        .limit(1);

    if (error) {
        console.error('Error checking eligibility:', error);
        return false;
    }

    // 2. Check if user ALREADY reviewed it
    const { data: existingReview, error: reviewError } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();

    if (reviewError) {
        console.error('Error checking existing reviews:', reviewError);
    }

    const hasPurchased = eligibleOrders && eligibleOrders.length > 0;
    const hasReviewed = !!existingReview;

    return hasPurchased && !hasReviewed;
}

export async function deleteAddress(id: string) {
    const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function setDefaultAddress(userId: string, id: string) {
    // We can rely on the DB trigger to unset others
    const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', userId);

    if (error) throw error;
}


export async function getHeroSettings() {
    const { data, error } = await supabase
        .from('hero_settings')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching hero settings:', error);
        // Fallback default
        return {
            title: 'Quality Food For Your Healthy Life',
            subtitle: 'New Season Freshness',
            description: 'Get up to 50% OFF on your first order. Fresh produce delivered from farm to your doorstep.',
            image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX7x1HBOqMMI518qHW17jKGkryeaKonnXGEbdkBR4GvbEVZENLzYW_8cEKLeU3nLCoxfDxvRuzBWc2UMxkRlp8Qix2LgxHKpsToQHO10vMCHMKjOmg6ucwmqOZ7GIMiSBIxBw0qaqFeK63SiQ5EQ4C-LMvZy28P7MaNy4uzcV2DaK1H5zIykFWkZMYBE6Xh8ac9E1nba7cTZ14OBTrDW-wpN-j8lDq-VbvUaLl6OtViD2uWDMpEBWT1yXDZluirbsS6BEgrgXwzyI',
            button_text: 'Shop Now',
            button_link: '/shop'
        };
    }
    return data;
}

export async function updateHeroSettings(settings: any) {
    const { error } = await supabase
        .from('hero_settings')
        .update(settings)
        .eq('id', 1);

    if (error) throw error;
}

// -- Notices --
export interface Notice {
    id: number;
    text: string;
    active: boolean;
}

export async function getNotices(onlyActive = true): Promise<Notice[]> {
    let query = supabase.from('notices').select('*').order('created_at', { ascending: false });

    if (onlyActive) {
        query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching notices:', error);
        return [];
    }
    return data;
}

export async function createNotice(text: string) {
    const { error } = await supabase.from('notices').insert({ text });
    if (error) throw error;
}

export async function updateNotice(id: number, updates: Partial<Notice>) {
    const { error } = await supabase.from('notices').update(updates).eq('id', id);
    if (error) throw error;
}

export async function deleteNotice(id: number) {
    const { error } = await supabase.from('notices').delete().eq('id', id);
    if (error) throw error;
}

// -- Ad Scroller --
export interface AdScroll {
    id: number;
    image_url: string;
    active: boolean;
}

export async function getAds(onlyActive = true): Promise<AdScroll[]> {
    let query = supabase.from('ad_scrolls').select('*').order('created_at', { ascending: false });

    if (onlyActive) {
        query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching ads:', error);
        return [];
    }
    return data;
}

export async function createAd(imageUrl: string) {
    const { error } = await supabase.from('ad_scrolls').insert({ image_url: imageUrl });
    if (error) throw error;
}

export async function updateAd(id: number, updates: Partial<AdScroll>) {
    const { error } = await supabase.from('ad_scrolls').update(updates).eq('id', id);
    if (error) throw error;
}

export async function deleteAd(id: number) {
    const { error } = await supabase.from('ad_scrolls').delete().eq('id', id);
    if (error) throw error;
}

// -- Storage --
export async function uploadHeroImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
        .from('hero-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('hero-images')
        .getPublicUrl(fileName);

    return publicUrl;
}

export async function uploadAdImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
        .from('ad-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(fileName);

    return publicUrl;
}

export async function uploadCategoryImage(file: File, categorySlug: string, type: 'icon' | 'banner'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${categorySlug}/${type}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('category-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('category-images')
        .getPublicUrl(fileName);

    return `${publicUrl}?t=${Date.now()}`;
}

export async function uploadSpecialOfferImage(file: File, name: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const fileName = `${sanitizedName}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('special-offer-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false // Don't overwrite, unique filename
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('special-offer-images')
        .getPublicUrl(fileName);

    return publicUrl;
}

export async function updateSpecialCategory(id: number, name: string, description?: string, imageUrl?: string) {
    const { error } = await supabase.from('special_categories').update({
        name,
        description,
        image_url: imageUrl
    }).eq('id', id);

    if (error) throw error;
}

// Admin Reviews Management
export async function getAdminReviews(filters?: { rating?: number | 'all', visibility?: 'all' | 'visible' | 'hidden' }) {
    let query = supabase
        .from('reviews')
        .select(`
            *,
            User (name, image),
            products (name, images)
        `)
        .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.rating && filters.rating !== 'all') {
        query = query.eq('rating', filters.rating);
    }

    if (filters?.visibility) {
        if (filters.visibility === 'visible') {
            query = query.eq('is_hidden', false);
        } else if (filters.visibility === 'hidden') {
            query = query.eq('is_hidden', true);
        }
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching admin reviews:', error);
        throw error;
    }
    return data;
}

export async function toggleReviewVisibility(id: number | string, isHidden: boolean) {
    const { error } = await supabase
        .from('reviews')
        .update({ is_hidden: isHidden })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteReview(id: number | string) {
    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

