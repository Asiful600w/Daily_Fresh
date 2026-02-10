import { unstable_cache } from 'next/cache';
import { supabase, Notice, AdScroll } from './common';

// -- HERO SETTINGS --

const fetchHeroSettings = async () => {
    console.log(`fetching hero settings from cache/db`);

    const { data, error } = await supabase
        .from('hero_settings')
        .select('*')
        .maybeSingle();

    if (error) {
        console.error('Error fetching hero settings:', error);
        return {
            title: 'Quality Food For Your Healthy Life',
            subtitle: 'New Season Freshness',
            description: 'Get up to 50% OFF on your first order. Fresh produce delivered from farm to your doorstep.',
            image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop',
            button_text: 'Shop Now',
            button_link: '/shop'
        };
    }

    return {
        ...data,
    };
};

export const getHeroSettings = unstable_cache(
    fetchHeroSettings,
    ['hero-settings'],
    { revalidate: 60, tags: ['settings'] }
);

// -- NOTICES --

const fetchNotices = async (onlyActive = true): Promise<Notice[]> => {
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
};

export const getNotices = unstable_cache(
    fetchNotices,
    ['notices-list'],
    { revalidate: 60, tags: ['notices'] }
);

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

// -- ADS --

const fetchAds = async (onlyActive = true): Promise<AdScroll[]> => {
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
};

export const getAds = unstable_cache(
    fetchAds,
    ['ads-list'],
    { revalidate: 60, tags: ['ads'] }
);

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

// -- SPECIAL CATEGORIES --

const fetchSpecialCategories = async (): Promise<{ id: number; name: string; description?: string; image_url?: string }[]> => {
    const { data, error } = await supabase
        .from('special_categories')
        .select('id, name, description, image_url')
        .eq('active', true);

    if (error) {
        console.error('Error fetching special categories:', error);
        return [];
    }
    return data;
};

export const getSpecialCategories = unstable_cache(
    fetchSpecialCategories,
    ['special-categories'],
    { revalidate: 60, tags: ['categories'] }
);

export async function createSpecialCategory(name: string, description?: string, imageUrl?: string) {
    const { error } = await supabase
        .from('special_categories')
        .insert({ name, description, image_url: imageUrl });

    if (error) {
        console.error('Error creating special category:', error);
        throw error;
    }
}

export async function updateSpecialCategory(id: number, name: string, description?: string, imageUrl?: string) {
    const { error } = await supabase.from('special_categories').update({
        name,
        description,
        image_url: imageUrl
    }).eq('id', id);

    if (error) throw error;
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
