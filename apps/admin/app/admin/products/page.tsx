'use client';
import { getProductsPaginated, deleteProduct, updateProduct, getCategories, Category, ProductFilterOptions, PaginatedProducts } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminProductsPage() {
    const { adminUser } = useAdminAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();
    const queryMerchantId = searchParams.get('merchant_id');

    // Filter State
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState<ProductFilterOptions['sortBy']>('newest');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        // Load Categories on mount
        getCategories().then(setCategories);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            // Reset to page 1 when filters change
            setCurrentPage(1);
            fetchData(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedCategory, sortBy, minPrice, maxPrice, adminUser, queryMerchantId]); // Added queryMerchantId dependency

    // Fetch when page changes
    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage]);

    const fetchData = async (pageToFetch: number) => {
        // Wait for adminUser to check role, or proceed if loaded?
        // Actually, if adminUser is null but loading is false, it means not logged in?
        // useAdminAuth handles redirect usually?
        // Here we just skip fetch if auth loading/missing
        if (!adminUser) return;

        try {
            setLoading(true);
            // Determine effective Merchant ID
            let targetMerchantId = undefined;
            if (adminUser.role === 'merchant') {
                targetMerchantId = adminUser.id;
            } else if (adminUser.role === 'super_admin' && queryMerchantId) {
                targetMerchantId = queryMerchantId;
            }

            const options: ProductFilterOptions = {
                query: searchQuery,
                categoryId: selectedCategory || undefined,
                sortBy: sortBy,
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                page: pageToFetch,
                limit: pageSize,
                merchantId: targetMerchantId
            };
            const result: PaginatedProducts = await getProductsPaginated(options);
            setProducts(result.data);
            setTotalPages(result.totalPages);
            setTotalCount(result.count);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const toggleApproval = async (product: any) => {
        if (!confirm(`Are you sure you want to ${product.is_approved ? 'reject' : 'approve'} this product?`)) return;

        try {
            await updateProduct(product.id, { isApproved: !product.is_approved });
            // Optimistic update
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_approved: !p.is_approved } : p));
        } catch (error) {
            console.error('Error updating approval:', error);
            alert('Failed to update status');
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Products</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your product inventory ({totalCount} items)</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">

                    <Link
                        href="/admin/products/new"
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold shadow-lg shadow-green-500/20 whitespace-nowrap"
                    >
                        <span className="material-icons-round">add</span>
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                <div className="relative w-full sm:w-64">
                    <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-primary focus:border-primary shadow-sm"
                    />
                </div>

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-primary focus:border-primary shadow-sm outline-none"
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-primary focus:border-primary shadow-sm outline-none"
                >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="stock_asc">Stock: Low to High</option>
                    <option value="stock_desc">Stock: High to Low</option>
                </select>

                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min Price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-24 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-primary focus:border-primary shadow-sm outline-none"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                        type="number"
                        placeholder="Max Price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-24 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-primary focus:border-primary shadow-sm outline-none"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                                <th className="p-6 font-semibold">Product</th>
                                <th className="p-6 font-semibold">Category</th>
                                <th className="p-6 font-semibold">Price</th>
                                <th className="p-6 font-semibold">Stock</th>
                                <th className="p-6 font-semibold">Status</th>
                                {adminUser?.role === 'super_admin' && <th className="p-6 font-semibold">Merchant</th>}
                                <th className="p-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">Loading products...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">No products found.</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 p-1 shrink-0 overflow-hidden">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <span className="material-icons-round text-sm">image_not_supported</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{product.name}</p>
                                                    <p className="text-xs text-slate-500">{product.quantity}</p>
                                                    {(product.sizes && product.sizes.length > 0) && (
                                                        <p className="text-xs text-slate-400 mt-1">Sizes: {product.sizes.join(', ')}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-slate-600 dark:text-slate-300">
                                            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="p-6 font-bold text-slate-900 dark:text-white">
                                            {formatPrice(product.price)}
                                        </td>
                                        <td className="p-6">
                                            {product.stockQuantity === 0 ? (
                                                <span className="text-red-500 font-bold text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">Out of Stock</span>
                                            ) : (
                                                <span className={`font-medium ${product.stockQuantity < 10 ? 'text-orange-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {product.stockQuantity} units
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            {product.is_approved ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-800">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold border border-yellow-200 dark:border-yellow-800">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-600"></span>
                                                    Pending
                                                </span>
                                            )}
                                        </td>

                                        {adminUser?.role === 'super_admin' && (
                                            <td className="p-6 text-sm text-slate-600 dark:text-slate-300">
                                                {product.shop_name || 'Daily Fresh'}
                                            </td>
                                        )}

                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Super Admin Approval Actions */}
                                                {adminUser?.role === 'super_admin' && (
                                                    <button
                                                        onClick={() => toggleApproval(product)}
                                                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${product.is_approved
                                                            ? 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-slate-400 hover:text-yellow-600'
                                                            : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-400 hover:text-green-600'
                                                            }`}
                                                        title={product.is_approved ? "Reject Product" : "Approve Product"}
                                                    >
                                                        <span className="material-icons-round text-lg">
                                                            {product.is_approved ? 'block' : 'check_circle'}
                                                        </span>
                                                    </button>
                                                )}

                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition-colors"
                                                >
                                                    <span className="material-icons-round text-lg">edit</span>
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this product?')) {
                                                            const handleDelete = async () => {
                                                                try {
                                                                    await deleteProduct(product.id);
                                                                    fetchData(currentPage);
                                                                } catch (e) {
                                                                    alert('Failed to delete product');
                                                                }
                                                            };
                                                            handleDelete();
                                                        }
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <span className="material-icons-round text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Showing page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}
