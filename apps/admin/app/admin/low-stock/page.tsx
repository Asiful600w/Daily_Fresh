'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLowStockProducts } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import NextImage from 'next/image';
import { useCallback } from 'react';

export default function LowStockPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const data = await getLowStockProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch low stock products', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-text-muted">arrow_back</span>
                </Link>
                <h1 className="text-2xl font-bold text-text-main">Low Stock Alert</h1>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 text-[11px] uppercase tracking-wider font-bold border-b border-red-100 dark:border-red-900/20">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Current Stock</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted">Loading...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted">No low stock items found.</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 relative bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                    {product.image && <NextImage src={product.image} alt={product.name} className="object-cover" fill sizes="40px" />}
                                                </div>
                                                <span className="text-sm font-bold text-text-main">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-muted">{product.category}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-text-main">{formatPrice(product.price)}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                {product.stock_quantity} left
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Restock</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
