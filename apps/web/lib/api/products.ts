import { supabase, mapProduct, Product } from './common';

export interface ProductFilterOptions {
    query?: string;
    categoryId?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc' | 'newest';
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
}

export interface PaginatedProducts {
    data: Product[];
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export type SortOption = 'price-asc' | 'price-desc' | 'newest';

export async function getProducts(options?: ProductFilterOptions | string): Promise<Product[]> {
    const filter = typeof options === 'string' ? { query: options } : (options || {});

    let query = supabase
        .from('products')
        .select(`
            *,
            categories (name),
            special_categories (name),
            subcategories (name)
        `)
        .eq('is_deleted', false);

    if (filter.query) {
        query = query.ilike('name', `%${filter.query}%`);
    }

    if (filter.categoryId) {
        query = query.eq('category_id', filter.categoryId);
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
            special_categories (name),
            subcategories (name)
        `, { count: 'exact' })
        .eq('is_deleted', false);

    if (options.query) {
        query = query.ilike('name', `%${options.query}%`);
    }

    if (options.categoryId) {
        query = query.eq('category_id', options.categoryId);
    }

    if (options.minPrice !== undefined) {
        query = query.gte('price', options.minPrice);
    }

    if (options.maxPrice !== undefined) {
        query = query.lte('price', options.maxPrice);
    }

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

export async function getProductsByCategory(slug: string, subcategory?: string, sort?: any): Promise<Product[]> {
    let query = supabase
        .from('products')
        .select(`
            *,
            categories!inner (name, slug),
            subcategories (name),
            special_categories (name)
        `)
        .eq('is_deleted', false)
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
            .eq('is_deleted', false)
            .eq('categories.slug', slug)
            .eq('subcategories.name', subcategory);
    }

    if (sort) {
        switch (sort) {
            case 'price-asc': query = query.order('price', { ascending: true }); break;
            case 'price-desc': query = query.order('price', { ascending: false }); break;
            case 'newest': query = query.order('created_at', { ascending: false }); break;
            default: query = query.order('id', { ascending: true });
        }
    } else {
        query = query.order('id', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
        console.error(`Error fetching products for category ${slug}:`, error);
        return [];
    }

    return data.map(mapProduct);
}

export async function getProductsBySpecialCategory(specialCategoryName: string, sort?: string): Promise<Product[]> {
    const { data: specialCat } = await supabase.from('special_categories').select('id').eq('name', specialCategoryName).single();
    if (!specialCat) return [];

    let query = supabase
        .from('products')
        .select(`
            *,
            categories (name, slug),
            special_categories (name),
            subcategories (name)
        `)
        .eq('is_deleted', false)
        .eq('special_category_id', specialCat.id);

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
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories (name),
            special_categories (name),
            subcategories (name)
        `)
        .eq('is_deleted', false)
        .eq('is_featured', true)
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
            special_categories (name),
            subcategories (name)
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
    const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('category_id, subcategory_id')
        .eq('id', productId)
        .single();

    if (fetchError || !currentProduct) {
        return [];
    }

    let query = supabase
        .from('products')
        .select(`
            *,
            categories (name),
            special_categories (name),
            subcategories (name)
        `)
        .eq('is_deleted', false)
        .eq('category_id', currentProduct.category_id)
        .neq('id', productId)
        .limit(limit);

    query = query.order('sold_count', { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching related products:', error);
        return [];
    }

    return data.map(mapProduct);
}

export async function createProduct(product: Partial<Product> & { specialCategoryId?: number }) {
    const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('name', product.category)
        .single();

    if (!category) throw new Error(`Category ${product.category} not found`);

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
        images: product.images || [],
        colors: product.colors,
        sizes: product.sizes,
        special_category_id: product.specialCategoryId
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

export async function updateProduct(id: string | number, product: Partial<Product> & { specialCategoryId?: number }) {
    const updates: any = {};
    if (product.name) updates.name = product.name;
    if (product.price !== undefined) updates.price = product.price;
    if (product.originalPrice !== undefined) updates.original_price = product.originalPrice;
    if (product.discountPercent !== undefined) updates.discount_percent = product.discountPercent;
    if (product.description) updates.description = product.description;
    if (product.quantity) updates.quantity_label = product.quantity;
    if (product.stockQuantity !== undefined) updates.stock_quantity = product.stockQuantity;
    if (product.images) updates.images = product.images;
    if (product.colors) updates.colors = product.colors;
    if (product.sizes) updates.sizes = product.sizes;
    if (product.specialCategoryId !== undefined) updates.special_category_id = product.specialCategoryId;

    if (product.category) {
        const { data: category } = await supabase.from('categories').select('id').eq('name', product.category).single();
        if (category) {
            updates.category_id = category.id;
            if (product.subcategory) {
                const { data: sub } = await supabase
                    .from('subcategories')
                    .select('id')
                    .eq('name', product.subcategory)
                    .eq('category_id', category.id)
                    .single();
                updates.subcategory_id = sub ? sub.id : null;
            } else {
                updates.subcategory_id = null;
            }
        }
    }

    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating product:', error);
        throw error;
    }
    return mapProduct(data);
}

export async function deleteProduct(id: number) {
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

export async function searchProducts(query: string): Promise<Product[]> {
    if (!query) return [];
    try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) return [];
        const { data } = await response.json();
        return Array.isArray(data) ? data.map(mapProduct) : [];
    } catch (error) {
        console.error('Error fetching search results:', error);
        return [];
    }
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
    return data.map((p: any) => ({
        ...p,
        image: p.images && p.images.length > 0 ? p.images[0] : '',
        category: p.categories?.name || (Array.isArray(p.categories) ? p.categories[0]?.name : 'Unknown')
    }));
}
