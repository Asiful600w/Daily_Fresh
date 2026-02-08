'use client';

import { useState, useEffect } from 'react';
import { Notice, getNotices, createNotice, updateNotice, deleteNotice, getHeroSettings, updateHeroSettings } from '@/lib/api';

export function NoticeSettings() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [newNotice, setNewNotice] = useState('');
    const [loading, setLoading] = useState(true);
    const [showScroller, setShowScroller] = useState(true);
    const [savingVisibility, setSavingVisibility] = useState(false);

    const loadNotices = async () => {
        setLoading(true);
        const data = await getNotices(false); // Fetch all, including inactive
        setNotices(data);
        setLoading(false);
    };

    const loadSettings = async () => {
        try {
            const settings = await getHeroSettings();
            setShowScroller(settings.show_notice_scroller !== false);
        } catch (error) {
            console.error('Error loading settings:', error);
            // Default to true if column doesn't exist yet
            setShowScroller(true);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadNotices();
        loadSettings();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNotice.trim()) return;

        await createNotice(newNotice);
        setNewNotice('');
        loadNotices();
    };

    const handleToggle = async (id: number, current: boolean) => {
        await updateNotice(id, { active: !current });
        loadNotices();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this notice?')) return;
        await deleteNotice(id);
        loadNotices();
    };

    const handleToggleVisibility = async () => {
        setSavingVisibility(true);
        try {
            await updateHeroSettings({ show_notice_scroller: !showScroller });
            setShowScroller(!showScroller);
        } catch (error: any) {
            console.error('Failed to update visibility:', error);
            if (error.message?.includes('show_notice_scroller')) {
                alert('Please run the SQL script "add_notice_visibility_toggle.sql" in Supabase to add the required database column.');
            } else {
                alert('Failed to update visibility: ' + (error.message || 'Unknown error'));
            }
        } finally {
            setSavingVisibility(false);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-[#1e3a31] bg-white dark:bg-[#10221c] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Notice Scroller
                </h2>
                <button
                    onClick={handleToggleVisibility}
                    disabled={savingVisibility}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${showScroller
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        } hover:opacity-80 disabled:opacity-50`}
                    title={showScroller ? 'Hide notice scroller from main site' : 'Show notice scroller on main site'}
                >
                    <span className="material-icons-round text-sm">
                        {showScroller ? 'visibility' : 'visibility_off'}
                    </span>
                    {showScroller ? 'Visible on Site' : 'Hidden from Site'}
                </button>
            </div>

            {/* Add New Notice */}
            <form onSubmit={handleAdd} className="flex gap-4 mb-8">
                <input
                    type="text"
                    value={newNotice}
                    onChange={(e) => setNewNotice(e.target.value)}
                    placeholder="Enter new notice text..."
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                />
                <button
                    type="submit"
                    disabled={!newNotice.trim()}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add
                </button>
            </form>

            {/* List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-8 text-slate-500">Loading notices...</div>
                ) : notices.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No notices found. Add one above!</div>
                ) : (
                    notices.map((notice) => (
                        <div
                            key={notice.id}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${notice.active
                                ? 'bg-primary/5 border-primary/20'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-70'
                                }`}
                        >
                            <span className={`font-medium ${notice.active ? 'text-slate-900 dark:text-white' : 'text-slate-500 line-through'}`}>
                                {notice.text}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleToggle(notice.id, notice.active)}
                                    className={`p-2 rounded-lg transition-colors ${notice.active
                                        ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30'
                                        : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    title={notice.active ? "Deactivate" : "Activate"}
                                >
                                    <span className="material-icons-round text-xl">
                                        {notice.active ? 'check_circle' : 'remove_circle_outline'}
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleDelete(notice.id)}
                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="Delete"
                                >
                                    <span className="material-icons-round text-xl">delete</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
