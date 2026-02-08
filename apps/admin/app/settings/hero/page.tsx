'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { HeroSection, getHeroSection, saveHeroSection } from '@/actions/hero';
import Image from 'next/image';

export default function HeroSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [heroData, setHeroData] = useState<Partial<HeroSection>>({
        title: '',
        subtitle: '',
        button_text: 'Shop Now',
        button_link: '/shop',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        loadHero();
    }, []);

    const loadHero = async () => {
        const data = await getHeroSection();
        if (data) {
            setHeroData(data);
            setPreviewUrl(data.image_url);
        }
        setLoading(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            let imageUrl = heroData.image_url;

            if (imageFile) {
                // Upload image
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `hero/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('hero-images')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('hero-images')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            if (!imageUrl) {
                alert('Please upload an image');
                setSaving(false);
                return;
            }

            const { success, error } = await saveHeroSection({
                title: heroData.title || '',
                subtitle: heroData.subtitle || '',
                button_text: heroData.button_text || '',
                button_link: heroData.button_link || '',
                image_url: imageUrl,
            } as any);

            if (success) {
                alert('Hero section updated successfully!');
            } else {
                throw new Error(error);
            }

        } catch (error: any) {
            console.error('Error saving hero:', error);
            alert(`Failed to save: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">Hero Section Settings</h1>

            <form onSubmit={handleSave} className="space-y-8 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Hero Image
                    </label>
                    <div className="flex items-center gap-6">
                        <div className="w-64 h-36 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden relative border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center group cursor-pointer">
                            {previewUrl ? (
                                <Image
                                    src={previewUrl}
                                    alt="Hero Preview"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span className="material-icons-round text-4xl text-slate-400">add_photo_alternate</span>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-bold text-sm">Change Image</span>
                            </div>
                        </div>
                        <div className="text-sm text-slate-500">
                            <p>Recommended size: 1920x1080px</p>
                            <p>Max file size: 5MB</p>
                            <p>Format: JPG, PNG, WEBP</p>
                        </div>
                    </div>
                </div>

                {/* Text Fields */}
                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={heroData.title}
                            onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="e.g. Fresh Groceries Delivered"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Subtitle
                        </label>
                        <textarea
                            value={heroData.subtitle || ''}
                            onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all h-24 resize-none"
                            placeholder="e.g. Get farm-fresh produce delivered to your doorstep within 2 hours."
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Button Text
                            </label>
                            <input
                                type="text"
                                value={heroData.button_text || ''}
                                onChange={(e) => setHeroData({ ...heroData, button_text: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="e.g. Shop Now"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Button Link
                            </label>
                            <input
                                type="text"
                                value={heroData.button_link || ''}
                                onChange={(e) => setHeroData({ ...heroData, button_link: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="e.g. /shop"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2"
                    >
                        {saving && <span className="material-icons-round animate-spin text-sm">refresh</span>}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

            </form>
        </div>
    );
}
