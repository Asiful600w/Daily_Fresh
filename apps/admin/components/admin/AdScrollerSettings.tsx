'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdScroll, getAds, createAd, updateAd, deleteAd, uploadAdImage } from '@/lib/api';
import NextImage from 'next/image';
import { processImageForBanner } from '@/lib/imageProcessor';

export function AdScrollerSettings() {
    const [ads, setAds] = useState<AdScroll[]>([]);
    const [newAdUrl, setNewAdUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const loadAds = useCallback(async () => {
        setLoading(true);
        const data = await getAds(false);
        setAds(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadAds();
    }, [loadAds]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdUrl.trim()) return;

        await createAd(newAdUrl);
        setNewAdUrl('');
        loadAds();
    };

    const handleToggle = async (id: number, current: boolean) => {
        await updateAd(id, { active: !current });
        loadAds();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this ad?')) return;
        await deleteAd(id);
        loadAds();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const processedFile = await processImageForBanner(file, 800, 440);
            const publicUrl = await uploadAdImage(processedFile);
            await createAd(publicUrl);
            loadAds();
            e.target.value = '';
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-[#1e3a31] bg-white dark:bg-[#10221c] p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                Ad Scroller Images
            </h2>

            {/* Add New Ad */}
            <div className="mb-8 space-y-4">
                <div className="flex items-center gap-4">
                    <label className={`flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-300 font-bold text-sm ${uploading ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}>
                        <span className={`material-icons-round ${uploading ? 'animate-spin' : ''}`}>{uploading ? 'refresh' : 'cloud_upload'}</span>
                        {uploading ? 'Optimizing...' : 'Upload Image'}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={loading || uploading}
                        />
                    </label>
                    <span className="text-slate-400 text-sm">or</span>
                </div>

                <p className="text-xs text-blue-500 -mt-2 mb-1 font-medium pl-1">
                    Recommended Size: 800x440px. Aspect Ratio: ~1.8:1 (Landscape)
                </p>
                <p className="text-[10px] text-slate-400 mb-4 pl-1">
                    Supported formats: JPG, PNG, WebP. We recommend <span className="font-semibold text-slate-500">WebP</span> for superior performance.
                </p>

                <form onSubmit={handleAdd} className="flex gap-4">
                    <input
                        type="text"
                        value={newAdUrl}
                        onChange={(e) => setNewAdUrl(e.target.value)}
                        placeholder="Enter image URL manually..."
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={!newAdUrl.trim()}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add URL
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-8 text-slate-500">Loading ads...</div>
                ) : ads.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-slate-500">No ads found. Add an image URL above!</div>
                ) : (
                    ads.map((ad) => (
                        <div
                            key={ad.id}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${ad.active
                                ? 'bg-white dark:bg-[#10221c] border-slate-200 dark:border-[#1e3a31]'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-70'
                                }`}
                        >
                            <div className="w-24 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 relative border border-slate-200 dark:border-slate-700">
                                <NextImage src={ad.image_url} alt="Ad" className="object-cover" fill sizes="96px" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-3" title={ad.image_url}>
                                    {ad.image_url}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggle(ad.id, ad.active)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${ad.active
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                                            : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300'
                                            }`}
                                    >
                                        {ad.active ? 'Active' : 'Inactive'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ad.id)}
                                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto"
                                        title="Delete"
                                    >
                                        <span className="material-icons-round text-lg">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
