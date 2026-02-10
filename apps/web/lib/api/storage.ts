import { supabase } from './common';

export async function uploadHeroImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
        .from('hero-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('hero-images')
        .getPublicUrl(fileName);

    return publicUrl;
}

export async function uploadAdImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
        .from('ad-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(fileName);

    return publicUrl;
}

export async function uploadCategoryImage(file: File, categorySlug: string, type: 'icon' | 'banner'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${categorySlug}/${type}.${fileExt}`;

    const { error } = await supabase.storage
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

    const { error } = await supabase.storage
        .from('special-offer-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('special-offer-images')
        .getPublicUrl(fileName);

    return publicUrl;
}
