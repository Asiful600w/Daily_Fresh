'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createCategory, updateCategory, getCategoryById, uploadCategoryImage } from '@/lib/api';
import { processImage, processImageForBanner } from '@/lib/imageProcessor';

interface CategoryFormProps {
    id?: string; // If ID is provided, it's edit mode
}

export default function CategoryForm({ id }: CategoryFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [uploading, setUploading] = useState<'icon' | 'banner' | null>(null);
    const [processing, setProcessing] = useState<'icon' | 'banner' | null>(null);

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

        // Validate formats and size
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!ALLOWED_TYPES.includes(file.type)) {
            alert('Please upload a supported image format (JPG, PNG, WebP, GIF).');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size is too large. Maximum is 5MB.');
            return;
        }

        try {
            setProcessing(type);

            // Process image based on type
            let processedFile: File;
            if (type === 'icon') {
                processedFile = await processImage(file);
            } else {
                processedFile = await processImageForBanner(file);
            }

            setProcessing(null);
            setUploading(type);

            const publicUrl = await uploadCategoryImage(processedFile, formData.slug, type);

            if (type === 'icon') {
                setFormData(prev => ({ ...prev, image_url: publicUrl }));
            } else {
                setFormData(prev => ({ ...prev, banner_url: publicUrl }));
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to process or upload image.');
        } finally {
            setProcessing(null);
            setUploading(null);
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

                <div className="space-y-4">
                    <label className="text-sm font-bold text-text-muted">Category Assets</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Icon Upload */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Icon / Grid Image</label>
                            <div className="relative group aspect-square rounded-xl border-2 border-dashed border-border-subtle overflow-hidden flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/50 hover:border-primary/50 transition-colors">
                                {formData.image_url ? (
                                    <>
                                        <Image src={formData.image_url} alt="Icon Preview" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <label className="p-2 bg-white rounded-full text-primary cursor-pointer hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined block">edit</span>
                                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'icon')} className="hidden" />
                                            </label>
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined block">delete</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 text-center">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                                            <span className="material-symbols-outlined">add_photo_alternate</span>
                                        </div>
                                        <span className="text-xs font-bold text-text-muted">Upload Icon</span>
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'icon')} className="hidden" />
                                    </label>
                                )}

                                {(processing === 'icon' || uploading === 'icon') && (
                                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-bold text-primary mt-2">
                                            {processing === 'icon' ? 'PROCESSING...' : 'UPLOADING...'}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 text-center italic">Square 800x800 recommended</p>
                        </div>

                        {/* Banner Upload */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Hero Banner</label>
                            <div className="relative group aspect-square md:aspect-auto md:h-full rounded-xl border-2 border-dashed border-border-subtle overflow-hidden flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/50 hover:border-primary/50 transition-colors" style={{ minHeight: '160px' }}>
                                {formData.banner_url ? (
                                    <>
                                        <Image src={formData.banner_url} alt="Banner Preview" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <label className="p-2 bg-white rounded-full text-primary cursor-pointer hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined block">edit</span>
                                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} className="hidden" />
                                            </label>
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, banner_url: '' }))} className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined block">delete</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 text-center">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                                            <span className="material-symbols-outlined">imagesmode</span>
                                        </div>
                                        <span className="text-xs font-bold text-text-muted">Upload Banner</span>
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} className="hidden" />
                                    </label>
                                )}

                                {(processing === 'banner' || uploading === 'banner') && (
                                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-bold text-primary mt-2">
                                            {processing === 'banner' ? 'PROCESSING...' : 'UPLOADING...'}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 text-center italic">Wide aspect ratio optimized</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase px-1">Icon URL</label>
                            <input
                                type="url"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-transparent text-text-main focus:ring-primary focus:border-primary"
                                placeholder="Backup Icon URL"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase px-1">Banner URL</label>
                            <input
                                type="url"
                                value={formData.banner_url}
                                onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-transparent text-text-main focus:ring-primary focus:border-primary"
                                placeholder="Backup Banner URL"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border-subtle">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-text-main">Subcategories</label>
                        <button type="button" onClick={addSubcategory} className="text-sm text-primary font-bold hover:underline">
                            + Add Subcategory
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.subcategories.map((sub, index) => (
                            <div key={index} className="flex gap-2 group animate-in slide-in-from-top-1 duration-200">
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
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                    {formData.subcategories.length === 0 && (
                        <p className="text-sm text-text-muted italic text-center py-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-border-subtle">No subcategories added yet.</p>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-border-subtle">
                    <Link href="/admin/categories" className="px-8 py-2.5 rounded-lg font-bold border border-border-subtle text-text-muted hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !!uploading || !!processing}
                        className="px-8 py-2.5 rounded-lg font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:grayscale"
                    >
                        {loading ? 'Saving...' : id ? 'Update Category' : 'Create Category'}
                    </button>
                </div>
            </form>
        </div>
    );
}
