'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createCategory, updateCategory, getCategoryById, uploadCategoryImage } from '@/lib/api';

interface CategoryFormProps {
    id?: string; // If ID is provided, it's edit mode
}

export default function CategoryForm({ id }: CategoryFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        image_url: '',
        banner_url: '',
        subcategories: [] as { id?: string; name: string }[]
    });

    useEffect(() => {
        if (id) {
            fetchCategory(id);
        }
    }, [id]);

    const fetchCategory = async (catId: string) => {
        try {
            const data = await getCategoryById(catId);
            if (data) {
                setFormData({
                    name: data.name,
                    slug: data.slug,
                    image_url: data.img || '',
                    banner_url: data.banner || '',
                    subcategories: data.subcategories.map(s => ({ id: s.id, name: s.name }))
                });
            }
        } catch (error) {
            console.error('Failed to fetch category', error);
        } finally {
            setFetching(false);
        }
    };

    const handleSubcategoryChange = (index: number, value: string) => {
        const newSubs = [...formData.subcategories];
        newSubs[index].name = value;
        setFormData({ ...formData, subcategories: newSubs });
    };

    const addSubcategory = () => {
        setFormData({
            ...formData,
            subcategories: [...formData.subcategories, { name: '' }]
        });
    };

    const removeSubcategory = (index: number) => {
        const newSubs = formData.subcategories.filter((_, i) => i !== index);
        setFormData({ ...formData, subcategories: newSubs });
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        if (!id && !formData.slug) {
            // Auto-generate slug on creating new
            setFormData({ ...formData, name, slug: generateSlug(name) });
        } else {
            setFormData({ ...formData, name });
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'banner') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!formData.slug) {
            alert('Please enter a Category Name first to generate a slug.');
            e.target.value = ''; // Reset input
            return;
        }

        try {
            setLoading(true);
            const publicUrl = await uploadCategoryImage(file, formData.slug, type);

            if (type === 'icon') {
                setFormData(prev => ({ ...prev, image_url: publicUrl }));
            } else {
                setFormData(prev => ({ ...prev, banner_url: publicUrl }));
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await updateCategory(id, formData);
            } else {
                await createCategory({
                    ...formData,
                    subcategories: formData.subcategories.map(s => s.name) // Create only needs names
                });
            }
            router.push('/admin/categories');
            router.refresh();
        } catch (error) {
            console.error('Failed to save category', error);
            alert('Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center text-text-muted">Loading category details...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/categories" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-text-muted">arrow_back</span>
                </Link>
                <h1 className="text-2xl font-bold text-text-main">{id ? 'Edit Category' : 'Add New Category'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-border-subtle shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-muted">Category Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={handleNameChange}
                            className="w-full px-4 py-2 rounded-lg border border-border-subtle bg-transparent text-text-main focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-muted">Slug (URL)</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-border-subtle bg-transparent text-text-main focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-muted">Icon / Slider Image</label>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-primary font-bold text-xs">
                            <span className="material-symbols-outlined text-sm">cloud_upload</span>
                            Upload Icon
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'icon')}
                                className="hidden"
                                disabled={loading}
                            />
                        </label>
                        <p className="text-[10px] text-slate-400 px-1">
                            Supported formats: JPG, PNG, WebP. We recommend <span className="font-semibold text-slate-500">WebP</span> for superior performance.
                        </p>
                        <input
                            type="url"
                            value={formData.image_url || ''}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-border-subtle bg-transparent text-text-main focus:ring-primary focus:border-primary"
                            placeholder="https://..."
                            required
                        />
                    </div>
                    {formData.image_url && (
                        <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-border-subtle">
                            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-muted">Hero Banner Image</label>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-primary font-bold text-xs">
                            <span className="material-symbols-outlined text-sm">cloud_upload</span>
                            Upload Banner
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'banner')}
                                className="hidden"
                                disabled={loading}
                            />
                        </label>
                        <p className="text-[10px] text-slate-400 px-1">
                            Supported formats: JPG, PNG, WebP. We recommend <span className="font-semibold text-slate-500">WebP</span> for superior performance.
                        </p>
                        <input
                            type="url"
                            value={formData.banner_url}
                            onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-border-subtle bg-transparent text-text-main focus:ring-primary focus:border-primary"
                            placeholder="https://..."
                        />
                    </div>
                    {formData.banner_url && (
                        <div className="mt-2 w-full h-32 rounded-lg overflow-hidden border border-border-subtle">
                            <img src={formData.banner_url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                <div className="space-y-4 pt-4 border-t border-border-subtle">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-text-main">Subcategories</label>
                        <button type="button" onClick={addSubcategory} className="text-sm text-primary font-bold hover:underline">
                            + Add Subcategory
                        </button>
                    </div>

                    {formData.subcategories.map((sub, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={sub.name}
                                onChange={(e) => handleSubcategoryChange(index, e.target.value)}
                                className="flex-1 px-4 py-2 rounded-lg border border-border-subtle bg-transparent text-text-main focus:ring-primary focus:border-primary"
                                placeholder="Subcategory Name"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => removeSubcategory(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    ))}
                    {formData.subcategories.length === 0 && (
                        <p className="text-sm text-text-muted italic">No subcategories added.</p>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-border-subtle">
                    <Link href="/admin/categories" className="px-6 py-2 rounded-lg font-bold border border-border-subtle text-text-muted hover:bg-gray-50 transition-colors">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 rounded-lg font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : id ? 'Update Category' : 'Create Category'}
                    </button>
                </div>
            </form>
        </div>
    );
}
