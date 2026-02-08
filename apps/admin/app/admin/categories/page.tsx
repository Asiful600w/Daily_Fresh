'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCategories, deleteCategory, getCategoryProducts, deleteProduct } from '@/lib/api';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Conflict Modal State
    const [conflictModalOpen, setConflictModalOpen] = useState(false);
    const [conflictingProducts, setConflictingProducts] = useState<any[]>([]);
    const [targetCategoryId, setTargetCategoryId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error: any) {
            console.error('Failed to fetch categories', error);
            // Alert the user to the error for debugging
            alert(`Debug Error: ${error.message || JSON.stringify(error)}`);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = async (id: string) => {
        // Check for conflicts first
        const products = await getCategoryProducts(id);
        if (products.length > 0) {
            setConflictingProducts(products);
            setTargetCategoryId(id);
            setConflictModalOpen(true);
        } else {
            if (confirm('Are you sure you want to delete this category?')) {
                performDelete(id);
            }
        }
    };

    const performDelete = async (id: string) => {
        try {
            await deleteCategory(id);
            setConflictModalOpen(false);
            setTargetCategoryId(null);
            fetchData(); // Refresh
        } catch (error: any) {
            console.error('Failed to delete category', error);
            alert(error.message || 'Failed to delete category');
        }
    };

    const handleProductDelete = async (productId: string) => {
        if (!confirm('Delete this product?')) return;
        try {
            await deleteProduct(productId);
            // Update local state
            const updated = conflictingProducts.filter(p => p.id !== productId);
            setConflictingProducts(updated);
            if (updated.length === 0) {
                // If no products left, user can now delete category
                // Optionally auto-delete or just let them click delete again.
                // Let's keep modal open but show "Safe to delete now" or just close and let them click delete?
                // Better: Auto-close and maybe prompt to delete category?
                // Simplest: Just refresh list.
            }
        } catch (error) {
            console.error('Failed to delete product', error);
            alert('Failed to delete product');
        }
    };

    const getTargetCategoryName = () => {
        return categories.find(c => c.id === targetCategoryId)?.name || 'Category';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-text-main">Categories</h1>
                <Link href="/admin/categories/new" className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Add Category
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-700 text-text-muted text-[11px] uppercase tracking-wider font-bold border-b border-border-subtle">
                            <tr>
                                <th className="px-6 py-4">Image</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4">Subcategories</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted">Loading...</td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted">No categories found.</td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-border-subtle">
                                                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-text-main">{cat.name}</td>
                                        <td className="px-6 py-4 text-sm text-text-muted">{cat.slug}</td>
                                        <td className="px-6 py-4 text-sm text-text-muted">
                                            {cat.subcategories?.length || 0} items
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/categories/${cat.id}`} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteClick(cat.id)}
                                                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Conflict Modal */}
            {conflictModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-border-subtle">
                            <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                                <span className="material-symbols-outlined">warning</span>
                                Cannot Delete "{getTargetCategoryName()}"
                            </h3>
                            <p className="text-text-muted mt-2">
                                This category contains <strong>{conflictingProducts.length}</strong> products. You must perform an action on them before deleting the category.
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-0">
                            {conflictingProducts.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined">check</span>
                                    </div>
                                    <p className="text-text-main font-bold">All products removed!</p>
                                    <p className="text-sm text-text-muted mb-4">You can now delete this category.</p>
                                    <button
                                        onClick={() => targetCategoryId && performDelete(targetCategoryId)}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                                    >
                                        Delete Category Now
                                    </button>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-slate-700/50 text-xs font-bold text-text-muted uppercase">
                                        <tr>
                                            <th className="px-6 py-3">Product</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-subtle">
                                        {conflictingProducts.map(product => (
                                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                            {product.image ? (
                                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                            ) : (
                                                                <span className="material-symbols-outlined text-gray-400 text-sm">image</span>
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-text-main">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/admin/products/${product.id}`}
                                                            target="_blank"
                                                            className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                                        >
                                                            Update
                                                        </Link>
                                                        <button
                                                            onClick={() => handleProductDelete(product.id)}
                                                            className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="p-4 border-t border-border-subtle flex justify-end">
                            <button
                                onClick={() => setConflictModalOpen(false)}
                                className="px-4 py-2 text-text-muted font-bold hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
