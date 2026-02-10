'use client';

import { useState, useEffect } from 'react';
import { getSpecialCategories, createSpecialCategory, updateSpecialCategory, deleteSpecialCategory, uploadSpecialOfferImage } from '@/lib/api';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { useCallback } from 'react';

export default function SpecialCategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<{ id: number, name: string, description?: string, image_url?: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', imageUrl: '' });

    const [editingId, setEditingId] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        try {
            const data = await getSpecialCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!formData.name) {
            alert('Please enter a Name first.');
            e.target.value = ''; // Reset
            return;
        }

        try {
            setIsSubmitting(true); // Reuse submitting state for loading
            const publicUrl = await uploadSpecialOfferImage(file, formData.name);
            setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (category: any) => {
        setEditingId(category.id);
        setFormData({
            name: category.name,
            description: category.description || '',
            imageUrl: category.image_url || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', imageUrl: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateSpecialCategory(editingId, formData.name, formData.description, formData.imageUrl);
            } else {
                await createSpecialCategory(formData.name, formData.description, formData.imageUrl);
            }
            handleCancelEdit(); // Reset form
            loadData();
            router.refresh();
        } catch (error) {
            alert('Failed to save category. Ensure name is unique.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure? This will remove the tag from all associated products.')) return;
        try {
            await deleteSpecialCategory(id);
            loadData();
        } catch (error) {
            alert('Failed to delete category');
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Special Offers</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage flash deals, seasonal offers, and special tags.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Create Form */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm sticky top-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                {editingId ? 'Edit Tag' : 'Add New Tag'}
                            </h3>
                            {editingId && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="text-xs text-red-500 hover:underline font-bold"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="e.g. Flash Deal"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Description (Optional)
                                    <span className={`float-right text-xs ${formData.description.split(/\s+/).filter(w => w).length > 20 ? 'text-red-500' : 'text-slate-400'}`}>
                                        {formData.description.split(/\s+/).filter(w => w).length} / 20 words
                                    </span>
                                </label>
                                <textarea
                                    className={`w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border focus:ring-2 outline-none ${formData.description.split(/\s+/).filter(w => w).length > 20
                                        ? 'border-red-500 focus:ring-red-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:ring-primary/20'
                                        }`}
                                    placeholder="Short description (max 20 words)..."
                                    rows={2}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                                {formData.description.split(/\s+/).filter(w => w).length > 20 && (
                                    <p className="text-xs text-red-500 mt-1">Description must be 20 words or less.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Offer Image (Optional)</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-primary font-bold text-xs">
                                        <span className="material-symbols-outlined text-sm">cloud_upload</span>
                                        Upload Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={isSubmitting}
                                        />
                                    </label>
                                    <p className="text-[10px] text-slate-400">
                                        Supported formats: JPG, PNG, WebP. We recommend <span className="font-semibold text-slate-500">WebP</span>.
                                        Best size: <span className="font-medium text-blue-500">800x440px</span> for sliders.
                                    </p>
                                    <input
                                        type="url"
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="https://..."
                                        value={formData.imageUrl}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    />
                                    {formData.imageUrl && (
                                        <div className="mt-2 w-full h-24 relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                            <NextImage src={formData.imageUrl} alt="Preview" className="object-cover" fill sizes="(max-width: 768px) 100vw, 300px" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">If provided, this offer will appear on the Home Page slider.</p>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || formData.description.split(/\s+/).filter(w => w).length > 20}
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : (editingId ? 'Update Tag' : 'Create Tag')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="md:col-span-2 space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading...</div>
                    ) : categories.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                            <span className="material-icons-round text-4xl text-slate-300 mb-2">local_offer</span>
                            <p className="text-slate-500">No special categories found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {categories.map(cat => (
                                <div key={cat.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        {cat.image_url ? (
                                            <div className="w-16 h-10 relative rounded-lg overflow-hidden bg-slate-100">
                                                <NextImage src={cat.image_url} alt={cat.name} className="object-cover" fill sizes="64px" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                                <span className="material-icons-round">local_offer</span>
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                {cat.name}
                                                {cat.image_url && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">Slider Active</span>}
                                            </h4>
                                            {cat.description && <p className="text-sm text-slate-500 line-clamp-1">{cat.description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                                            title="Edit"
                                        >
                                            <span className="material-icons-round">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <span className="material-icons-round">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
