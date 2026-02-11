'use client';

import { useState, useEffect, useCallback } from 'react';
import { getHeroSettings, updateHeroSettings, uploadHeroImage } from '@/lib/api';
import NextImage from 'next/image';
import { processImageForBanner } from '@/lib/imageProcessor';

export function HeroSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        image_url: '',
        button_text: '',
        button_link: ''
    });

    // Keep track of original data to revert on cancel
    const [originalData, setOriginalData] = useState(formData);

    // Image Validation State
    const [imageStatus, setImageStatus] = useState<{
        type: 'idle' | 'loading' | 'valid' | 'warning' | 'error';
        message: string;
        details?: string;
    }>({ type: 'idle', message: '' });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setImageStatus({ type: 'loading', message: 'Optimizing image...' });
            const processedFile = await processImageForBanner(file, 960, 600);
            setImageStatus({ type: 'loading', message: 'Uploading image...' });
            const publicUrl = await uploadHeroImage(processedFile);
            setFormData(prev => ({ ...prev, image_url: publicUrl }));
            setImageStatus({ type: 'valid', message: 'Image optimized & uploaded!', details: 'You must save changes to apply.' });
        } catch (error) {
            console.error('Upload failed:', error);
            setImageStatus({ type: 'error', message: 'Failed to process or upload image.' });
        }
    };

    const loadSettings = useCallback(async () => {
        try {
            const data = await getHeroSettings();
            if (data) {
                const newData = {
                    title: data.title || '',
                    subtitle: data.subtitle || '',
                    description: data.description || '',
                    image_url: data.image_url || '',
                    button_text: data.button_text || '',
                    button_link: data.button_link || ''
                };
                setFormData(newData);
                setOriginalData(newData);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Strict Validation Block
        if (imageStatus.type === 'error') {
            alert('Cannot save with an invalid image URL.');
            return;
        }

        setSaving(true);
        try {
            await updateHeroSettings(formData);
            setOriginalData(formData); // Update original data on success
            setIsEditing(false);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(originalData);
        setIsEditing(false);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

    const InputCounter = ({ current, max }: { current: number, max: number }) => (
        isEditing ? (
            <span className={`text-xs font-bold ml-auto ${current > max ? 'text-red-500' : 'text-slate-400'}`}>
                {current}/{max}
            </span>
        ) : null
    );

    const inputClasses = `w-full px-4 py-3 rounded-xl transition-all ${isEditing
        ? 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white'
        : 'bg-transparent border border-transparent px-0 font-medium text-slate-900 dark:text-white cursor-default'
        }`;

    return (
        <div className={`rounded-2xl border transition-colors p-6 ${isEditing ? 'bg-white dark:bg-[#10221c] border-slate-200 dark:border-[#1e3a31] shadow-xl' : 'bg-white/50 dark:bg-[#10221c]/50 border-transparent'}`}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-[#1e3a31]">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Hero Section
                </h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                        <span className="material-icons-round text-sm">edit</span>
                        Edit
                    </button>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 flex flex-col">
                        <div className="flex justify-between h-5">
                            <label className="text-sm font-bold text-slate-500 uppercase">Title</label>
                            <InputCounter current={formData.title.length} max={60} />
                        </div>
                        <input
                            type="text"
                            value={formData.title}
                            maxLength={60}
                            disabled={!isEditing}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2 flex flex-col">
                        <div className="flex justify-between h-5">
                            <label className="text-sm font-bold text-slate-500 uppercase">Subtitle</label>
                            <InputCounter current={formData.subtitle.length} max={40} />
                        </div>
                        <input
                            type="text"
                            value={formData.subtitle}
                            maxLength={40}
                            disabled={!isEditing}
                            onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                            className={inputClasses}
                        />
                    </div>
                </div>

                <div className="space-y-2 flex flex-col">
                    <div className="flex justify-between h-5">
                        <label className="text-sm font-bold text-slate-500 uppercase">Description</label>
                        <InputCounter current={formData.description.length} max={200} />
                    </div>
                    <textarea
                        rows={3}
                        value={formData.description}
                        maxLength={200}
                        disabled={!isEditing}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className={`${inputClasses} resize-none`}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase h-5 block">Hero Image</label>

                    {isEditing && (
                        <div className="mb-4">
                            <label className="block w-full cursor-pointer">
                                <span className="sr-only">Choose file</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-slate-500
                                        file:mr-4 file:py-2.5 file:px-4
                                        file:rounded-xl file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-primary/10 file:text-primary
                                        hover:file:bg-primary/20
                                        cursor-pointer disabled:opacity-50
                                    "
                                    disabled={imageStatus.type === 'loading'}
                                />
                            </label>
                            <p className="text-xs text-blue-500 mt-2 font-medium">Recommended Size: 960x600px (or larger). Aspect Ratio: ~1.6:1 (Landscape)</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Supported formats: JPG, PNG, WebP. We recommend <span className="font-semibold text-slate-500">WebP</span> for superior performance.
                            </p>
                            <p className="text-xs text-slate-400 mt-2">or enter URL manually below</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            {isEditing ? (
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    className={`flex-1 ${inputClasses} ${imageStatus.type === 'error' ? 'border-red-500 focus:ring-red-500/50' :
                                        imageStatus.type === 'warning' ? 'border-yellow-500 focus:ring-yellow-500/50' : ''
                                        }`}
                                />
                            ) : null}
                            {formData.image_url && (
                                <div className={`rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 relative group ${isEditing ? 'w-12 h-12' : 'w-full h-64 shadow-inner'}`}>
                                    <NextImage src={formData.image_url} alt="Preview" className="object-cover" fill sizes={isEditing ? '48px' : '100vw'} />
                                </div>
                            )}
                        </div>

                        {/* Image Validation Feedback (Only when editing) */}
                        {isEditing && formData.image_url && imageStatus.type !== 'idle' && (
                            <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${imageStatus.type === 'error' ? 'bg-red-50 text-red-600' :
                                imageStatus.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                                    imageStatus.type === 'loading' ? 'bg-slate-50 text-slate-500' :
                                        'bg-green-50 text-green-700'
                                }`}>
                                <span className="material-icons-round text-lg">
                                    {imageStatus.type === 'error' ? 'error' :
                                        imageStatus.type === 'warning' ? 'warning' :
                                            imageStatus.type === 'loading' ? 'sync' : 'check_circle'}
                                </span>
                                <div className="flex-1">
                                    <p>{imageStatus.message}</p>
                                    {imageStatus.details && <p className="text-xs opacity-80 mt-0.5 font-bold uppercase tracking-wide">{imageStatus.details}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 flex flex-col">
                        <div className="flex justify-between h-5">
                            <label className="text-sm font-bold text-slate-500 uppercase">Button Text</label>
                            <InputCounter current={formData.button_text.length} max={20} />
                        </div>
                        <input
                            type="text"
                            value={formData.button_text}
                            maxLength={20}
                            disabled={!isEditing}
                            onChange={e => setFormData({ ...formData, button_text: e.target.value })}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase h-5 block">Button Link</label>
                        <input
                            type="text"
                            value={formData.button_link}
                            disabled={!isEditing}
                            onChange={e => setFormData({ ...formData, button_link: e.target.value })}
                            className={inputClasses}
                        />
                    </div>
                </div>

                {isEditing && (
                    <div className="pt-4 flex justify-end gap-3 animate-in fade-in slide-in-from-bottom-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || imageStatus.type === 'error'}
                            className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
