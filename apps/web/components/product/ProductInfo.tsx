'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/api';
import { formatPrice } from '@/lib/format';

import { useWishlist } from '@/context/WishlistContext';

import { useFlyToCart } from '@/context/FlyToCartContext';

export function ProductInfo({ product }: { product: Product }) {
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState<string | null>(product.colors && product.colors.length > 0 ? product.colors[0] : null);
    const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);

    // Wishlist
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const isWishlisted = isInWishlist(Number(product.id));

    const handleWishlistClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted) {
            await removeFromWishlist(Number(product.id));
        } else {
            await addToWishlist(Number(product.id));
        }
    };

    // Description Toggle
    const [isExpanded, setIsExpanded] = useState(false);
    const description = product.description || `Enjoy the finest ${product.name}, sourced with care to bring nature's best to your table. Perfect for your daily needs.`;

    // Image Gallery State
    const [selectedImage, setSelectedImage] = useState<string>(product.images && product.images.length > 0 ? product.images[0] : '');

    const { addItem } = useCart();
    const { triggerFly } = useFlyToCart();

    const isOutOfStock = product.stockQuantity === 0;

    const handleAddToCart = (e: React.MouseEvent<HTMLElement>) => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            images: product.images || [],
            quantity: quantity,
            category: product.category,
            pack: product.quantity,
            color: selectedColor || undefined,
            size: selectedSize || undefined
        });

        triggerFly(e.currentTarget, selectedImage || '/placeholder-food.png', quantity);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery Section */}
            <div className="space-y-4">
                {/* Main Image */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm relative group overflow-hidden h-[500px] flex items-center justify-center">
                    {/* Discount Badge */}
                    {product.discountPercent && product.discountPercent > 0 && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sm">
                            {product.discountPercent}% OFF
                        </div>
                    )}
                    {/* Special Category Badge - Moved to ensure no overlap with Wishlist */}
                    {product.specialCategoryLabel && (
                        <div className={`absolute left-4 bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sm ${product.discountPercent ? 'top-14' : 'top-4'}`}>
                            {product.specialCategoryLabel}
                        </div>
                    )}

                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center pointer-events-none">
                            <span className="bg-red-500 text-white text-base sm:text-lg font-black px-6 py-3 rounded-full shadow-2xl uppercase tracking-[0.2em] transform -rotate-12 border-4 border-white/30">
                                Out of Stock
                            </span>
                        </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                        onClick={handleWishlistClick}
                        className="absolute top-4 right-4 bg-white/90 dark:bg-slate-700/90 p-2.5 rounded-full shadow-sm text-slate-400 dark:text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-600 transition-all z-20 group/wishlist"
                    >
                        <span className={`material-icons-round text-xl transform group-hover/wishlist:scale-110 transition-transform ${isWishlisted ? 'text-red-500' : ''}`}>
                            {isWishlisted ? 'favorite' : 'favorite_border'}
                        </span>
                    </button>

                    <img
                        src={selectedImage || '/placeholder-food.png'}
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image'; }}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 animate-scale-up"
                    />

                    {/* Image Dots Indicator */}
                    {product.images && product.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            {product.images.filter(img => img).map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setSelectedImage(img); }}
                                    className={`w-2 h-2 rounded-full transition-all ${selectedImage === img ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                                    aria-label={`View image ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Thumbnails */}
                {/* Ensure we only show thumbnails if we actually have > 1 VALID images */}
                {product.images && product.images.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide py-2 px-1">
                        {product.images.filter(img => img).map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(img)}
                                className={`relative w-20 h-20 rounded-xl border-2 p-1 flex-shrink-0 transition-all overflow-hidden bg-white dark:bg-slate-800 ${selectedImage === img
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                <img
                                    src={img}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    alt={`View ${idx + 1}`}
                                    className="w-full h-full object-contain rounded-lg"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col h-full">
                <div className="mb-2">
                    {isOutOfStock ? (
                        <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded-full uppercase tracking-wider">Out of Stock</span>
                    ) : (
                        <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-wider">In Stock ({product.stockQuantity})</span>
                    )}
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{product.name}</h1>
                <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-lg">/ {product.quantity || 'unit'}</span>
                </div>
                <div className="mb-8">
                    <p className={`text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line inline`}>
                        {isExpanded ? description : description.slice(0, 150) + (description.length > 150 ? '...' : '')}
                    </p>
                    {description.length > 150 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="ml-2 text-primary font-bold hover:underline text-sm inline-block"
                        >
                            {isExpanded ? 'See Less' : 'See All'}
                        </button>
                    )}
                </div>

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Available Colors</h3>
                        <div className="flex flex-wrap gap-3">
                            {product.colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedColor === color
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/50'
                                        }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Available Sizes</h3>
                        <div className="flex flex-wrap gap-3">
                            {product.sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`min-w-[3rem] px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedSize === size
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/50'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dynamic Product Info */}
                <div className="space-y-6 mb-8">
                    {/* Rating & Vendor Row */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        {/* Rating */}
                        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-500">
                                <span className="material-icons-round">star</span>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-black text-slate-900 dark:text-white">{product.average_rating || 0}</span>
                                    <span className="text-xs font-bold text-slate-400">/ 5</span>
                                </div>
                                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{product.reviews_count || 0} Verified Reviews</p>
                            </div>
                        </div>

                        {/* Vendor */}
                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-500">
                                <span className="material-icons-round">storefront</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">Sold By</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">{product.shop_name || product.vendor_name || 'Daily Fresh'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <span className="material-icons-round text-slate-400 text-sm">local_shipping</span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delivery Charges</h4>
                        </div>
                        <div className="flex divide-x divide-slate-100 dark:divide-slate-700">
                            <div className="flex-1 p-3 text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Inside Dhaka</p>
                                <p className="font-bold text-slate-900 dark:text-white">{formatPrice(product.shipping_inside_dhaka || 60)}</p>
                            </div>
                            <div className="flex-1 p-3 text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Outside Dhaka</p>
                                <p className="font-bold text-slate-900 dark:text-white">{formatPrice(product.shipping_outside_dhaka || 120)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-8 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl md:rounded-full p-1 justify-between md:w-36">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={isOutOfStock}
                                className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg md:rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-icons-round text-sm">remove</span>
                            </button>
                            <span className="font-bold text-lg px-2 text-slate-900 dark:text-white">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                disabled={isOutOfStock || quantity >= product.stockQuantity}
                                className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center bg-primary text-white rounded-lg md:rounded-full shadow-lg shadow-green-500/20 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-icons-round text-sm">add</span>
                            </button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className="flex-1 bg-primary text-white font-bold py-4 px-8 rounded-xl md:rounded-full shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg md:text-base"
                        >
                            <span className="material-icons-round">shopping_basket</span>
                            {isOutOfStock ? 'Out of Stock' : 'Add to cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
