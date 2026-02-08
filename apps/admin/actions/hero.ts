'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

export interface HeroSection {
    id: string;
    title: string;
    subtitle: string | null;
    image_url: string;
    button_text: string | null;
    button_link: string | null;
    is_active: boolean;
}

export async function getHeroSection(): Promise<HeroSection | null> {
    const { data, error } = await supabaseAdmin
        .from('hero_settings')
        .select('*')
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching hero settings:', error);
    }

    return data;
}

export async function saveHeroSection(data: Omit<HeroSection, 'id' | 'is_active'>) {
    try {
        // We'll update the single row if it exists, or insert if empty
        // Since we don't have is_active, we assume the single row is the active one.

        // Check if exists
        const existing = await getHeroSection();

        let error;
        if (existing) {
            const { error: updateError } = await supabaseAdmin
                .from('hero_settings')
                .update(data)
                .eq('id', existing.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabaseAdmin
                .from('hero_settings')
                .insert([data]); // Insert as array
            error = insertError;
        }

        if (error) throw error;

        revalidatePath('/'); // Revalidate web home
        return { success: true };
    } catch (error: any) {
        console.error('Error saving hero section:', error);
        return { success: false, error: error.message };
    }
}
