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
            subcategories: [{ name: '' }, ...formData.subcategories]
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
            e.target.value = '';
            return;
        }

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
                    subcategories: formData.subcategories.map(s => s.name)
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

    if (fetching) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-text-muted font-medium animate-pulse">Fetching category details...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/categories" className="group p-2 bg-white dark:bg-slate-800 hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm border border-border-subtle">
                        <span className="material-symbols-outlined block group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-text-main tracking-tight">
                            {id ? 'REfine Category' : 'Create Category'}
                        </h1>
                        <p className="text-sm text-text-muted font-medium">Manage your store's taxonomy and visual identity</p>
                    </div>
                </div>
                {id && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full border border-primary/20">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-xs font-bold uppercase tracking-widest">Edit Mode</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Primary Info & Subcategories */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Details Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-border-subtle shadow-xl shadow-slate-200/50 dark:shadow-none p-8 space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-border-subtle/50">
                                <span className="material-symbols-outlined text-primary">info</span>
                                <h2 className="text-lg font-black uppercase tracking-wider text-text-main">Basic Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={handleNameChange}
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-text-main focus:border-primary focus:ring-0 transition-all outline-none font-medium text-lg"
                                        placeholder="e.g. Fresh Vegetables"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">URL Slug</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full pl-5 pr-12 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-text-main focus:border-primary focus:ring-0 transition-all outline-none font-mono text-sm"
                                            placeholder="fresh-vegetables"
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">link</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subcategories Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-border-subtle shadow-xl shadow-slate-200/50 dark:shadow-none p-8 space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/50">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">account_tree</span>
                                    <h2 className="text-lg font-black uppercase tracking-wider text-text-main">Subcategories</h2>
                                </div>
                                <button type="button" onClick={addSubcategory} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Add New
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formData.subcategories.map((sub, index) => (
                                    <div key={index} className="flex gap-2 group animate-in zoom-in-95 duration-200">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={sub.name}
                                                onChange={(e) => handleSubcategoryChange(index, e.target.value)}
                                                className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-text-main focus:border-primary focus:ring-0 transition-all outline-none font-medium"
                                                placeholder="e.g. Organic Greens"
                                                required
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 pointer-events-none uppercase">#{index + 1}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeSubcategory(index)}
                                            className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all hover:rotate-90"
                                        >
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                ))}
                                {formData.subcategories.length === 0 && (
                                    <div className="md:col-span-2 flex flex-col items-center justify-center py-12 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">category</span>
                                        <p className="text-sm text-text-muted font-medium italic">No subcategories defined yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Assets & Actions */}
                    <div className="space-y-8">
                        {/* Media Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-border-subtle shadow-xl shadow-slate-200/50 dark:shadow-none p-8 space-y-8">
                            <div className="flex items-center gap-3 pb-2 border-b border-border-subtle/50">
                                <span className="material-symbols-outlined text-primary">variable_insert</span>
                                <h2 className="text-lg font-black uppercase tracking-wider text-text-main">Visual Assets</h2>
                            </div>

                            {/* Icon Upload Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Category Icon</label>
                                    <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">800x800</span>
                                </div>
                                <div className="relative group aspect-square rounded-[2rem] border-4 border-dashed border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 hover:border-primary/50 transition-all duration-300">
                                    {formData.image_url ? (
                                        <>
                                            <Image src={formData.image_url} alt="Icon" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                                <label className="p-4 bg-white rounded-3xl text-primary cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xl">
                                                    <span className="material-symbols-outlined block text-2xl">edit_square</span>
                                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'icon')} className="hidden" />
                                                </label>
                                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} className="p-4 bg-white rounded-3xl text-red-500 hover:scale-110 active:scale-95 transition-all shadow-xl">
                                                    <span className="material-symbols-outlined block text-2xl">delete_sweep</span>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 text-center group">
                                            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-primary/10">
                                                <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                                            </div>
                                            <span className="text-sm font-black text-text-main uppercase tracking-tighter">Choose Icon</span>
                                            <span className="text-[10px] text-text-muted mt-1 font-medium italic">Click to browse gallery</span>
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'icon')} className="hidden" />
                                        </label>
                                    )}

                                    {(processing === 'icon' || uploading === 'icon') && (
                                        <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center z-20">
                                            <div className="w-12 h-12 border-[6px] border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-xs font-black text-primary mt-4 tracking-widest animate-pulse">
                                                {processing === 'icon' ? 'OPTIMIZING...' : 'UPLOADING...'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Banner Upload Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Hero Banner</label>
                                    <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full italic uppercase">Landscape</span>
                                </div>
                                <div className="relative group aspect-[16/10] rounded-[2rem] border-4 border-dashed border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 hover:border-primary/50 transition-all duration-300">
                                    {formData.banner_url ? (
                                        <>
                                            <Image src={formData.banner_url} alt="Banner" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                                <label className="p-3 bg-white rounded-2xl text-primary cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xl">
                                                    <span className="material-symbols-outlined block text-xl">edit</span>
                                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} className="hidden" />
                                                </label>
                                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, banner_url: '' }))} className="p-3 bg-white rounded-2xl text-red-500 hover:scale-110 active:scale-95 transition-all shadow-xl">
                                                    <span className="material-symbols-outlined block text-xl">delete</span>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6 text-center group">
                                            <div className="w-12 h-12 rounded-full bg-slate-200/50 dark:bg-slate-800 text-slate-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined">imagesmode</span>
                                            </div>
                                            <span className="text-xs font-black text-text-main uppercase tracking-tighter">Upload Banner</span>
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} className="hidden" />
                                        </label>
                                    )}

                                    {(processing === 'banner' || uploading === 'banner') && (
                                        <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center z-20">
                                            <div className="w-10 h-10 border-[5px] border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-black text-primary mt-3 tracking-widest">
                                                {processing === 'banner' ? 'PROCESSING...' : 'UPLOADING...'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sticky Action Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-border-subtle shadow-xl p-8 space-y-6 lg:sticky lg:top-8">
                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={loading || !!uploading || !!processing}
                                    className="w-full py-5 rounded-[1.5rem] font-black text-lg bg-primary text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>SAVING...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">rocket_launch</span>
                                            <span>{id ? 'UPDATE CATEGORY' : 'PUBLISH CATEGORY'}</span>
                                        </>
                                    )}
                                </button>
                                <Link
                                    href="/admin/categories"
                                    className="w-full py-4 rounded-[1.5rem] font-bold text-sm border-2 border-slate-100 dark:border-slate-700 text-text-muted hover:bg-slate-50 dark:hover:bg-slate-900 text-center transition-all"
                                >
                                    CANCEL CHANGES
                                </Link>
                            </div>

                            <div className="pt-4 flex items-center gap-2 justify-center opacity-60">
                                <span className="material-symbols-outlined text-xs">verified</span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Safe To Publish</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
