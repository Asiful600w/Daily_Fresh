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
        .from('hero_sections')
        .select('*')
        .eq('is_active', true)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching hero section:', error);
    }

    return data;
}

export async function saveHeroSection(data: Omit<HeroSection, 'id' | 'is_active'>) {
    try {
        // We'll just insert a new one and set it as active, trigger will handle the rest
        // OR update the existing active one if we want to keep history?
        // Let's Insert new one to keep history of changes, simple.

        const { error } = await supabaseAdmin
            .from('hero_sections')
            .insert({
                ...data,
                is_active: true
            });

        if (error) throw error;

        revalidatePath('/'); // Revalidate web home
        return { success: true };
    } catch (error: any) {
        console.error('Error saving hero section:', error);
        return { success: false, error: error.message };
    }
}
