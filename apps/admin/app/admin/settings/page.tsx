'use client';

import { useState } from 'react';
import { HeroSettings } from '@/components/admin/HeroSettings';
import { NoticeSettings } from '@/components/admin/NoticeSettings';
import { AdScrollerSettings } from '@/components/admin/AdScrollerSettings';

type Tab = 'general' | 'notices' | 'ads';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('general');

    const menuItems = [
        { id: 'general', label: 'General & Hero', icon: 'web' },
        { id: 'notices', label: 'Notice Scroller', icon: 'campaign' },
        { id: 'ads', label: 'Ad Scroller', icon: 'view_carousel' },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#0b1a15] p-6 lg:p-10">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your website content and configurations.</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as Tab)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === item.id
                                        ? 'bg-white dark:bg-[#10221c] text-primary shadow-lg shadow-primary/5 ring-1 ring-slate-100 dark:ring-[#1e3a31]'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#10221c] hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    <span className={`material-icons-round text-xl ${activeTab === item.id ? 'text-primary' : 'opacity-70'}`}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 min-w-0">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <HeroSettings />
                                </div>
                            )}

                            {activeTab === 'notices' && (
                                <div className="space-y-6">
                                    <NoticeSettings />
                                </div>
                            )}

                            {activeTab === 'ads' && (
                                <div className="space-y-6">
                                    <AdScrollerSettings />
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
