'use client';

import { useState, useEffect } from 'react';
import { Product, getCategories, getSpecialCategories, Category, createProduct, updateProduct } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { supabaseClient as supabase } from '@/lib/supabaseClient';
import { useAdminAuth } from '@/context/AdminAuthContext';
import NextImage from 'next/image';
import { processImages } from '@/lib/imageProcessor';

export function ProductForm({ initialData }: { initialData?: Partial<Product> }) {
    const { adminUser } = useAdminAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categoriesList, setCategoriesList] = useState<Category[]>([]);
    const [specialCategoriesList, setSpecialCategoriesList] = useState<{ id: number, name: string }[]>([]);
    const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
    // Image Upload State
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>(initialData?.images || []);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);

    // We store the 'specialCategoryId' in the formData. 
    // Note: The API requires resolved IDs usually, but for updateProduct we might need to handle this.
    // However, updateProduct in api.ts currently takes a Partial<Product> and resolves mainly the Category/Subcategory names.
    // We should make sure we pass the specialCategory ID correctly. 
    // Looking at api.ts, updateProduct doesn't currently handle 'specialCategoryId' update explicitly in the easy way if it expects just 'specialCategoryLabel'.
    // Wait, V2 SQL implementation has `special_category_id` column.
    // But `updateProduct` in `api.ts` (lines 282+) essentially just resolves Category/Subcategory by name.
    // It DOES NOT yet update `special_category_id`.
    // I need to update `lib/api.ts` `updateProduct` and `createProduct` to handle `special_category_id` and `discount_percent`.
    // For this Form, I will add the fields to state.

    // Helper to get ID from label if needed, or we just pass the ID if we update the API to take ID.
    // For now, let's store standard fields.

    const [activeTab, setActiveTab] = useState<'details' | 'seo'>('details');

    const [formData, setFormData] = useState<Partial<Product> & { specialCategoryId?: number }>({
        id: initialData?.id, // Keep ID if editing
        name: initialData?.name || '',
        price: initialData?.price || 0,
        originalPrice: initialData?.originalPrice || 0,
        category: initialData?.category || '',
        subcategory: initialData?.subcategory || '',
        description: initialData?.description || '',
        stockQuantity: initialData?.stockQuantity || 0,
        colors: initialData?.colors || [],
        sizes: initialData?.sizes || [],
        quantity: initialData?.quantity || '',
        discountPercent: initialData?.discountPercent || 0,
        specialCategoryId: undefined,
        images: initialData?.images || [],
        metaTitle: initialData?.metaTitle || '',
        metaDescription: initialData?.metaDescription || '',
        canonicalUrl: initialData?.canonicalUrl || '',
        keywords: initialData?.keywords || [],
        noIndex: initialData?.noIndex || false,
        ogImage: initialData?.ogImage || ''
    });

    useEffect(() => {
        const loadData = async () => {
            const [cats, specialCats] = await Promise.all([getCategories(), getSpecialCategories()]);
            setCategoriesList(cats);
            setSpecialCategoriesList(specialCats);

            if (initialData?.category) {
                const selectedCat = cats.find(c => c.name === initialData.category);
                if (selectedCat && selectedCat.subcategories) {
                    setAvailableSubcategories(selectedCat.subcategories.map(s => s.name));
                }
            }

            // Try to match special category label to ID if editing
            if (initialData?.specialCategoryLabel) {
                const match = specialCats.find(sc => sc.name === initialData.specialCategoryLabel);
                if (match) {
                    setFormData(prev => ({ ...prev, specialCategoryId: match.id }));
                }
            }
        };
        loadData();
    }, [initialData]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryName = e.target.value;
        const selectedCat = categoriesList.find(c => c.name === categoryName);

        setFormData({
            ...formData,
            category: categoryName,
            subcategory: ''
        });

        if (selectedCat && selectedCat.subcategories) {
            setAvailableSubcategories(selectedCat.subcategories.map(s => s.name));
        } else {
            setAvailableSubcategories([]);
        }
    };

    // Auto-calculate Price logic
    const handleDiscountChange = (val: string) => {
        const newDiscount = val === '' ? 0 : parseInt(val);
        if (isNaN(newDiscount)) return;

        const basePrice = formData.originalPrice || formData.price || 0;
        const discount = Math.min(100, Math.max(0, newDiscount));

        let newPrice = formData.price;
        if (basePrice > 0) {
            newPrice = Math.round(basePrice * (1 - discount / 100));
        }

        setFormData(prev => ({
            ...prev,
            discountPercent: val === '' ? undefined : discount, // Store as is or 0? Better to keep as number usually, but for input control sometimes string is needed. 
            // Actually, safely calling it 0 is fine for logic, but for UI we might want to allow empty. 
            // Let's stick to safe number for now to satisfy the "Received NaN" error.
            // If we use 0, clearing the box sets it to 0 immediately. 
            price: newPrice,
            originalPrice: basePrice
        }));
    };

    const handleOriginalPriceChange = (val: string) => {
        const newOriginal = val === '' ? 0 : parseFloat(val);
        if (isNaN(newOriginal)) return;

        const discount = formData.discountPercent || 0;
        const newPrice = Math.round(newOriginal * (1 - discount / 100));
        setFormData(prev => ({
            ...prev,
            originalPrice: newOriginal,
            price: newPrice
        }));
    };

    const [colorInput, setColorInput] = useState('');

    // Image Handling
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length + previewUrls.length > 6) {
                alert("You can only have up to 6 images per product.");
                return;
            }

            // Process images: resize to 800x800, center, compress to WebP
            setProcessing(true);
            try {
                const { processedFiles, previewUrls: newPreviews } = await processImages(files);
                setSelectedFiles(prev => [...prev, ...processedFiles]);
                setPreviewUrls(prev => [...prev, ...newPreviews]);
            } catch (err) {
                console.error('Image processing failed:', err);
                alert('Failed to process one or more images. Please try again.');
            } finally {
                setProcessing(false);
            }
        }
    };

    const removeImage = (index: number) => {
        // If index < existing images count (from initialData), it's a URL removal
        // If it's a new file, we need to remove from selectedFiles

        // Actually, let's keep it simple: previewUrls tracks ALL images (existing + new previews)
        // We need to know which are 'new files' to remove from 'selectedFiles'

        // Better strategy:
        // previewUrls: all strings.
        // selectedFiles: just the File objects. 
        // Mapping is hard if we delete from middle.

        // Let's just rebuild previewUrls and handle files carefully? 
        // Or simpler: We don't support deleting 'newly added but not uploaded' individually easily without complex state.
        // Let's just remove from previewUrls. 
        // BUT we need to not upload the file then.

        // Correct approach:
        // Maintain a single list of items: { type: 'url' | 'file', content: string | File }
        // But for time saving, let's just reset if they want to change? No, that's bad UX.

        // Let's stick to: 
        // formData.images = existing URLs.
        // selectedFiles = new files.
        // When rendering, show [...formData.images, ...selectedFiles.map(preview)]

        // Wait, I put logic in render.
        // Let's rethink state:
        // images: (string | File)[]

        // Since I'm using previewUrls as the source of truth for display:
        // When removing index i:
        // output = previewUrls.filter((_, idx) => idx !== i)
        // setPreviewUrls(output)
        // If it was a File, remove from selectedFiles? 
        // This is tricky.

        // New Plan:
        // Just use `previewUrls` for display.
        // `existingImages`: string[] (URLs)
        // `newFiles`: File[]
        // Render existing, then new.
        // Remove button on existing -> remove from `existingImages`.
        // Remove button on new -> remove from `newFiles`.

        const existingCount = formData.images?.length || 0;

        if (index < existingCount) {
            // Removing an existing image
            setFormData(prev => ({
                ...prev,
                images: prev.images?.filter((_, i) => i !== index)
            }));
            setPreviewUrls(prev => prev.filter((_, i) => i !== index));
        } else {
            // Removing a new file
            const fileIndex = index - existingCount;
            setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex));
            setPreviewUrls(prev => prev.filter((_, i) => i !== index));
        }
    };

    const uploadImages = async (productId: string) => {
        const uploadedUrls: string[] = [];

        for (const file of selectedFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${productId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                // Continue with others? Or fail?
                continue;
            }

            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            if (data) {
                uploadedUrls.push(data.publicUrl);
            }
        }
        return uploadedUrls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Prepare initial payload (without images)
            console.log('Admin User:', adminUser);
            console.log('Admin User ID:', adminUser?.id);
            console.log('Admin User Role:', adminUser?.role);

            const payload = {
                ...formData,
                images: formData.images || [], // Keep existing images if editing
                // Only include ID if editing
                ...(initialData?.id && { id: initialData.id }),
                // Attach Merchant Info if applicable
                merchantId: adminUser?.id, // Always include user ID
                shopName: adminUser?.role === 'MERCHANT' ? (adminUser.shop_name || adminUser.full_name) : undefined
            };

            console.log('Submitting product payload:', payload);

            // 2. Save product first to get the ID
            const { upsertProductAction } = await import('@/actions/products');
            const result = await upsertProductAction(payload as any);

            console.log('Server action result:', result);

            if (!result.success) {
                throw new Error(result.error);
            }

            // 3. Upload images if any new files selected
            if (selectedFiles.length > 0 && result.data?.id) {
                setUploading(true);
                const productId = String(result.data.id);
                console.log('Uploading images for product ID:', productId);

                const newImageUrls = await uploadImages(productId);
                console.log('Uploaded image URLs:', newImageUrls);

                // 4. Update product with image URLs
                if (newImageUrls.length > 0) {
                    const finalImages = [...(formData.images || []), ...newImageUrls];
                    const updateResult = await upsertProductAction({
                        ...payload,
                        id: result.data.id,
                        images: finalImages
                    } as any);

                    if (!updateResult.success) {
                        console.error('Failed to update product with images:', updateResult.error);
                    } else {
                        console.log('Product updated with images successfully');
                    }
                }
            }

            router.push('/admin/products');
            router.refresh();

        } catch (error: any) {
            console.error('Failed to save product:', error);
            alert(`Failed to save product: ${error.message}`);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const handleAddColor = () => {
        if (colorInput.trim()) {
            setFormData(prev => ({
                ...prev,
                colors: [...(prev.colors || []), colorInput.trim()]
            }));
            setColorInput('');
        }
    };

    const removeColor = (colorToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors?.filter(c => c !== colorToRemove) || []
        }));
    };

    const [sizeInput, setSizeInput] = useState('');
    const handleAddSize = () => {
        if (sizeInput.trim()) {
            setFormData(prev => ({
                ...prev,
                sizes: [...(prev.sizes || []), sizeInput.trim()]
            }));
            setSizeInput('');
        }
    };

    const removeSize = (sizeToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes?.filter(s => s !== sizeToRemove) || []
        }));
    };



    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-700">
                <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                    Product Details
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('seo')}
                    className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'seo' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                    SEO Settings
                </button>
            </div>

            <div className={activeTab === 'details' ? 'block space-y-8' : 'hidden'}>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">

                    {/* Header */}
                    <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product Information</h2>
                        <p className="text-sm text-slate-500">Manage basic product details, pricing, and inventory.</p>
                    </div>

                    {/* Special Offers Section */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 space-y-4">
                        <h3 className="font-bold text-primary flex items-center gap-2">
                            <span className="material-icons-round">local_offer</span>
                            Special Offers & Pricing
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Original Price ({'\u09F3'})</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={formData.originalPrice}
                                    onChange={e => handleOriginalPriceChange(e.target.value)}
                                    placeholder="Base Price"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Discount (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={formData.discountPercent ?? ''}
                                    onChange={e => handleDiscountChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Special Tag</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={formData.specialCategoryId || ''}
                                    onChange={e => setFormData({ ...formData, specialCategoryId: parseInt(e.target.value) })}
                                >
                                    <option value="">None</option>
                                    {specialCategoriesList.map(sc => (
                                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Product Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={formData.category}
                                    onChange={handleCategoryChange}
                                >
                                    <option value="">Select Category</option>
                                    {categoriesList.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            {availableSubcategories.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subcategory</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        value={formData.subcategory}
                                        onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                                    >
                                        <option value="">Select Subcategory</option>
                                        {availableSubcategories.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Final Price & Stock */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Final Price ({'\u09F3'})</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-primary"
                                value={formData.price}
                                readOnly
                                title="Auto-calculated from Original Price - Discount"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Stock Quantity</label>
                            <input
                                type="number"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                value={formData.stockQuantity}
                                onChange={e => setFormData({ ...formData, stockQuantity: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Unit Label</label>
                            <input
                                type="text"
                                placeholder="e.g. 1kg, 500g, Pack"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                        <textarea
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Colors */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Available Colors</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Add a color (e.g. Red, Blue)"
                                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                value={colorInput}
                                onChange={e => setColorInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                            />
                            <button
                                type="button"
                                onClick={handleAddColor}
                                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.colors?.map((color) => (
                                <span key={color} className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {color}
                                    <button type="button" onClick={() => removeColor(color)} className="hover:text-red-500">
                                        <span className="material-icons-round text-base">close</span>
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Sizes */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Available Sizes</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Add a size (e.g. S, M, XL, 42)"
                                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                value={sizeInput}
                                onChange={e => setSizeInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                            />
                            <button
                                type="button"
                                onClick={handleAddSize}
                                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.sizes?.map((size) => (
                                <span key={size} className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {size}
                                    <button type="button" onClick={() => removeSize(size)} className="hover:text-red-500">
                                        <span className="material-icons-round text-base">close</span>
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Product Images */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Product Images (Max 6)</label>

                        {/* Image Grid */}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {previewUrls.map((url, idx) => (
                                <div key={idx} className="relative aspect-square bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 group">
                                    <NextImage src={url} alt={`Preview ${idx}`} className="object-cover" fill sizes="150px" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="material-icons-round text-xs">close</span>
                                    </button>
                                </div>
                            ))}

                            {/* Upload Button */}
                            {previewUrls.length < 6 && (
                                <label className={`aspect-square bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center transition-colors ${processing ? 'cursor-wait opacity-60' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                        disabled={processing}
                                    />
                                    {processing ? (
                                        <>
                                            <span className="material-icons-round text-primary animate-spin mb-1">refresh</span>
                                            <span className="text-xs font-bold text-primary">Optimizing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-icons-round text-slate-400 mb-1">add_photo_alternate</span>
                                            <span className="text-xs font-bold text-slate-500">Add Image</span>
                                        </>
                                    )}
                                </label>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">First image will be the primary display image.</p>
                    </div>
                </div>
            </div>

            {/* SEO Section */}
            <div className={activeTab === 'seo' ? 'block' : 'hidden'}>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-8">
                    <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Search Engine Optimization</h2>
                        <p className="text-sm text-slate-500">Optimize how your product appears in search results.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* SEO Fields */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Meta Title</label>
                                    <span className={`text-xs ${(formData.metaTitle?.length || 0) > 60 ? 'text-red-500' : 'text-slate-400'}`}>
                                        {formData.metaTitle?.length || 0} / 60
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={formData.metaTitle}
                                    placeholder={formData.name || "Product Name"}
                                    onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
                                />
                                <p className="text-xs text-slate-500">Leave blank to use Product Name.</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Meta Description</label>
                                    <span className={`text-xs ${(formData.metaDescription?.length || 0) > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                                        {formData.metaDescription?.length || 0} / 160
                                    </span>
                                </div>
                                <textarea
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={formData.metaDescription}
                                    placeholder={formData.description?.slice(0, 160) || "Short description of the product..."}
                                    onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
                                />
                                <p className="text-xs text-slate-500">Leave blank to use Product Description.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Keywords</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={formData.keywords?.join(', ')}
                                    placeholder="Comma separated keywords (e.g. fresh, organic, vegetables)"
                                    onChange={e => setFormData({ ...formData, keywords: e.target.value.split(',').map(k => k.trim()) })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Canonical URL</label>
                                <input
                                    type="url"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={formData.canonicalUrl}
                                    onChange={e => setFormData({ ...formData, canonicalUrl: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                <input
                                    type="checkbox"
                                    id="noIndex"
                                    checked={formData.noIndex}
                                    onChange={e => setFormData({ ...formData, noIndex: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="noIndex" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    No Index (Hide from Search Engines)
                                </label>
                            </div>
                        </div>

                        {/* Google Search Preview */}
                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 block">Google Search Preview</label>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 max-w-xl">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-500">Logo</div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-[#202124]">Daily Fresh</span>
                                        <span className="text-xs text-[#5f6368]">https://dailyfresh.com/product/{formData.name?.toLowerCase().replace(/\s+/g, '-')}</span>
                                    </div>
                                    <span className="material-icons-round text-lg text-[#5f6368] ml-auto">more_vert</span>
                                </div>
                                <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate mb-1">
                                    {formData.metaTitle || formData.name || "Product Name"}
                                </h3>
                                <p className="text-sm text-[#4d5156] line-clamp-2">
                                    {formData.metaDescription || formData.description || "Product description will appear here..."}
                                </p>
                            </div>
                            <p className="text-xs text-slate-500 mt-4">
                                * This is a simulation. Actual appearance on Google may vary.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {uploading && <span className="material-icons-round animate-spin text-sm">refresh</span>}
                    {loading ? (uploading ? 'Uploading...' : 'Saving...') : 'Save Product'}
                </button>
            </div>
        </form >
    );
}
