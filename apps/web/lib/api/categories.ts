import { unstable_cache } from 'next/cache';
import { supabase, mapCategory, Category } from './common';

const fetchCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
        .from('categories')
        .select(`
            id, name, slug, image_url, banner_url, is_hidden,
            subcategories (
                name,
                products:products(count)
            )
        `)
        .eq('is_hidden', false);

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data.map(mapCategory);
};

export const getCategories = unstable_cache(
    fetchCategories,
    ['categories-list'],
    { revalidate: 3600, tags: ['categories'] }
);

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

    // 2. Manage Subcategories
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
    return data.map((p: any) => ({ ...p, image: p.image_url }));
}

export async function deleteSubcategory(id: string) {
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) throw error;
}

export async function getCategoryStats() {
    try {
        // Try to fetch from view first (if user ran the SQL)
        const { data: viewData, error: viewError } = await supabase
            .from('category_stats')
            .select('*')
            .order('total_items_sold', { ascending: false });

        if (!viewError && viewData) {
            const total = viewData.reduce((sum: number, item: any) => sum + item.total_items_sold, 0);
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
