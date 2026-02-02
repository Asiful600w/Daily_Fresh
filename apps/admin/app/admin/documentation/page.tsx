'use client';

import { useState } from 'react';
import { ScrollReset } from '@/components/ScrollReset';

export default function DocumentationPage() {
    const [activeSection, setActiveSection] = useState('getting-started');

    const sections = [
        { id: 'getting-started', title: 'Getting Started', icon: 'start' },
        { id: 'dashboard', title: 'Dashboard Overview', icon: 'dashboard' },
        { id: 'product-management', title: 'Product Management', icon: 'inventory_2' },
        { id: 'order-management', title: 'Order Management', icon: 'shopping_bag' },
        { id: 'merchant-guide', title: 'Merchant Guide', icon: 'store' },
        { id: 'admin-guide', title: 'Super Admin Guide', icon: 'admin_panel_settings' },
        { id: 'account-settings', title: 'Account Settings', icon: 'settings' },
    ];

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="flex gap-8 max-w-7xl mx-auto items-start">
            <ScrollReset />

            {/* Sidebar Navigation */}
            <div className="w-64 shrink-0 hidden lg:block sticky top-24">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Contents</h3>
                    </div>
                    <nav className="p-2 space-y-1">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === section.id
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-[20px] ${activeSection === section.id ? 'text-primary' : 'text-slate-400'}`}>
                                    {section.icon}
                                </span>
                                {section.title}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-12 pb-24">

                {/* Getting Started */}
                <section id="getting-started" className="scroll-mt-28">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <span className="material-symbols-outlined text-3xl">start</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Getting Started</h1>
                                <p className="text-slate-500">Welcome to the Daily Fresh Admin Panel.</p>
                            </div>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                            <p>
                                The Daily Fresh Admin Panel is your command center for managing your e-commerce business.
                                Whether you are a Merchant managing your own shop or a Super Admin overseeing the entire platform,
                                this guide will help you navigate and utilize all features effectively.
                            </p>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3">Accessing the Panel</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>**Login**: Use your registered email and password at `/admin/login`.</li>
                                <li>**Registration**: New merchants can register at `/admin/register`. Approval may be required.</li>
                                <li>**Forgot Password**: Contact support to reset your credentials if you lose access.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Dashboard Overview */}
                <section id="dashboard" className="scroll-mt-28">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                <span className="material-symbols-outlined text-3xl">dashboard</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h2>
                                <p className="text-slate-500">Understanding your business at a glance.</p>
                            </div>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                            <p>
                                Upon logging in, you are greeted by the Dashboard. This page gives you real-time insights into your performance.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 not-prose">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Key Metrics</h4>
                                    <ul className="text-sm space-y-2 text-slate-600 dark:text-slate-400">
                                        <li>• **Total Revenue**: Sum of all completed orders.</li>
                                        <li>• **Total Orders**: Count of all orders placed.</li>
                                        <li>• **Products**: Number of active products in your catalog.</li>
                                        <li>• **Customers**: Total unique customers (Super Admin only).</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Recent Activity</h4>
                                    <ul className="text-sm space-y-2 text-slate-600 dark:text-slate-400">
                                        <li>• **Recent Orders**: Quick list of the latest 5 orders with status.</li>
                                        <li>• **Charts**: Visual representation of sales over time.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Product Management */}
                <section id="product-management" className="scroll-mt-28">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <span className="material-symbols-outlined text-3xl">inventory_2</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Product Management</h2>
                                <p className="text-slate-500">Adding, editing, and optimizing your catalog.</p>
                            </div>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                            <p>
                                Navigate to the **Products** tab to manage your inventory.
                            </p>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3">Adding a New Product</h3>
                            <ol className="list-decimal pl-5 space-y-2">
                                <li>Click the **"Add Product"** button in the top right.</li>
                                <li>**Basic Info**: Enter Name, Category, and Subcategory.</li>
                                <li>**Pricing**:
                                    <ul className="list-disc pl-5 mt-1">
                                        <li>Enter **Original Price**.</li>
                                        <li>Enter **Discount %** (optional).</li>
                                        <li>The **Final Price** is auto-calculated. Do not edit it manually.</li>
                                    </ul>
                                </li>
                                <li>**Stock**: Enter the available quantity.</li>
                                <li>**Images**: Upload up to 6 high-quality images. The first one is the main cover.</li>
                                <li>**SEO Settings**: Switch to the SEO tab to add Meta Titles, Keywords, and check the Google Search Preview. **Crucial for visibility!**</li>
                            </ol>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3">Editing & Deleting</h3>
                            <p>
                                Click the **Pencil Icon** (Edit) to modify any details. Click the **Trash Icon** (Delete) to remove a product.
                                <em>Note: Deleted products cannot be recovered easily.</em>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Order Management */}
                <section id="order-management" className="scroll-mt-28">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <span className="material-symbols-outlined text-3xl">shopping_bag</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Order Management</h2>
                                <p className="text-slate-500">Processing and fulfilling customer orders.</p>
                            </div>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                            <p>
                                The **Orders** section lists all customer purchases.
                            </p>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3">Order Lifecycle</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold mt-1">Pending</span>
                                    <p className="text-sm">New order received. Verify stock and customer details.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold mt-1">Processing</span>
                                    <p className="text-sm">Mark as processing when packing begins.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold mt-1">Delivered</span>
                                    <p className="text-sm">Mark as delivered once the customer receives the item.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold mt-1">Cancelled</span>
                                    <p className="text-sm">Use this if the customer cancels or stock is unavailable.</p>
                                </div>
                            </div>

                            <p className="mt-4">
                                Click on any order row to view **Full Details**, including shipping address, customer phone, and item breakdown.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Merchant Guide */}
                <section id="merchant-guide" className="scroll-mt-28">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-indigo-500">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <span className="material-symbols-outlined text-3xl">store</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Merchant Guide</h2>
                                <p className="text-slate-500">Specific instructions for Shop Owners.</p>
                            </div>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                                As a Merchant, your view is focused on YOUR products and YOUR orders.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-4">
                                <li>**Privacy**: You cannot see orders or products from other merchants.</li>
                                <li>**Shop Info**: Go to **Settings** to update your Shop Name and Contact Details.</li>
                                <li>**Support**: If you face technical issues, contact the Super Admin via the support email (coming soon).</li>
                                <li>**Payouts**: Currently handled manually. Please ensure your payment details in Settings are up to date.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Super Admin Guide */}
                <section id="admin-guide" className="scroll-mt-28">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-red-500">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Super Admin Guide</h2>
                                <p className="text-slate-500">Platform management and oversight.</p>
                            </div>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                            <p className="font-medium text-red-600 dark:text-red-400">
                                ⚠ This section is only visible to Super Admins.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-4">
                                <li>**Merchants**: View the **Merchants** tab to approve new registrations or ban violating shops.</li>
                                <li>**Customers**: View all registered users in the **Customers** tab.</li>
                                <li>**Categories**: Manage global product categories and subcategories.</li>
                                <li>**Special Offers**: Create banner campaigns and special category tags (e.g., "Ramadan Special").</li>
                                <li>**System Wide Access**: You can edit or delete ANY product or order if necessary for moderation.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Settings */}
                <section id="account-settings" className="scroll-mt-28">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                <span className="material-symbols-outlined text-3xl">settings</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h2>
                                <p className="text-slate-500">Profile and security.</p>
                            </div>
                        </div>
                        <div className="text-slate-600 dark:text-slate-300">
                            <p>
                                Go to the **Settings** page to:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Update your **Full Name**.</li>
                                <li>Change your **Shop Name** (Merchants).</li>
                                <li>Update your **Password** (via the "Change Password" button).</li>
                                <li>Toggle **Dark Mode** for the admin panel UI.</li>
                            </ul>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
