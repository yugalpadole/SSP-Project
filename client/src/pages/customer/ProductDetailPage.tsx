import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Truck,
  Clock,
  ShieldCheck,
  Plus,
  Minus,
  ShoppingBag,
  Layers,
  ArrowRight,
  MessageSquare,
  Sparkles,
  ChevronRight,
  TrendingDown,
  CheckCircle2,
  Check,
  Award,
  Zap,
  Info
} from 'lucide-react';
import { Product, Review, ProductComparison, ProductSeller } from '../../types';
import { useCart } from '../../context/CartContext';
import { RatingStars } from '../../components/common/RatingStars';
import { SEO } from '../../components/common/SEO';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { items, addToCart, updateQuantity } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [comparison, setComparison] = useState<ProductComparison | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedQty, setSelectedQty] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'total' | 'delivery' | 'rating'>('price');
  const [recentlyAddedId, setRecentlyAddedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data.product);
          setComparison(data.comparison || null);
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-semibold">Loading product and comparing shop prices...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto my-12">
        <h2 className="text-lg font-bold text-stone-900">Product Not Found</h2>
        <p className="text-xs text-stone-500 mt-1 mb-4">This product might no longer be available in stores.</p>
        <Link to="/products" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600">
          Browse Other Products
        </Link>
      </div>
    );
  }

  const available = product.available_stock !== undefined ? product.available_stock : product.stock_quantity;
  const isOutOfStock = available <= 0;
  const isLowStock = available > 0 && available <= 5;

  const cartItem = items.find((i) => i.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  const allSellers = comparison?.allSellers || [];

  // Sort comparison sellers according to tab
  const sortedSellers = [...allSellers].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'total') {
      const totalA = a.price + (a.delivery_charge || 0);
      const totalB = b.price + (b.delivery_charge || 0);
      return totalA - totalB;
    }
    if (sortBy === 'delivery') {
      return (a.delivery_charge || 0) - (b.delivery_charge || 0);
    }
    if (sortBy === 'rating') {
      return (b.shop_rating || 0) - (a.shop_rating || 0);
    }
    return 0;
  });

  const handleAddSellerToCart = (seller: ProductSeller) => {
    const sellerProduct: Product = {
      id: seller.product_id,
      shop_id: seller.shop_id,
      category_id: product.category_id,
      name: seller.product_name,
      slug: seller.shop_slug,
      description: product.description,
      price: seller.price,
      mrp: seller.mrp,
      unit: seller.unit,
      image_url: seller.image_url || product.image_url,
      stock_quantity: seller.available_stock,
      reserved_quantity: 0,
      available_stock: seller.available_stock,
      is_active: 1,
      shop_name: seller.shop_name,
      shop_locality: seller.shop_locality,
      delivery_charge: seller.delivery_charge,
      estimated_delivery_time: seller.estimated_delivery_time,
    };

    const added = addToCart(sellerProduct, 1);
    if (added) {
      setRecentlyAddedId(seller.product_id);
      setTimeout(() => setRecentlyAddedId(null), 2000);
    }
  };

  const isSellerInCart = (prodId: number) => items.some((i) => i.product.id === prodId);

  return (
    <div className="space-y-12 pb-16">
      <SEO
        title={`${product.name} - Compare Local Prices | eBazaar`}
        description={`Compare prices for ${product.name} across neighborhood shops in Pune. Best local price from ₹${comparison?.lowestPrice || product.price}.`}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/" className="hover:text-emerald-700">Home</Link>
        <ChevronRight size={12} />
        <Link to="/products" className="hover:text-emerald-700">Products</Link>
        <ChevronRight size={12} />
        <span className="font-bold text-stone-800 truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Product Image */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-3xl overflow-hidden p-3 border border-white shadow-xl relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {discount && (
              <span className="absolute top-6 left-6 px-3 py-1 rounded-xl text-xs font-black bg-amber-500 text-white shadow-md">
                {discount}% OFF
              </span>
            )}

            {comparison && comparison.totalSellers > 1 && (
              <a
                href="#multi-shop-comparison"
                className="absolute bottom-6 right-6 px-3 py-1.5 rounded-xl text-xs font-black bg-white/95 text-emerald-800 shadow-md border border-emerald-100 flex items-center gap-1.5 hover:bg-white transition"
              >
                <Layers size={14} className="text-emerald-600" />
                <span>Compare {comparison.totalSellers} Shops</span>
              </a>
            )}
          </div>
        </div>

        {/* Right: Info, Price, Seller, Add To Cart */}
        <div className="lg:col-span-7 space-y-5">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md inline-block mb-2">
                {product.category_name || 'Daily Need'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Packaging / Unit: <strong>{product.unit || '1 unit'}</strong>
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl glass-pill bg-white/70 border border-emerald-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-stone-400 uppercase font-bold">Store Price</div>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="text-3xl font-black text-emerald-800">
                    ₹{product.price}
                  </span>
                  {product.mrp && product.mrp > product.price && (
                    <span className="text-sm text-stone-400 line-through">
                      MRP ₹{product.mrp}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Status Badge */}
              <div>
                {isOutOfStock ? (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-orange-100 text-orange-800 animate-pulse">
                    Only {available} available!
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck size={14} />
                    <span>In Stock ({available} units)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Multi-Shop Price Comparison Quick Banner */}
            {comparison && comparison.totalSellers > 1 && (
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  comparison.currentShopIsCheapest
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50/80 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl text-white shrink-0 ${
                        comparison.currentShopIsCheapest ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}
                    >
                      {comparison.currentShopIsCheapest ? (
                        <Award size={18} />
                      ) : (
                        <TrendingDown size={18} />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wide">
                        {comparison.currentShopIsCheapest
                          ? '🏆 Lowest Local Price Guaranteed!'
                          : `💡 Save ₹${comparison.savingsIfSwitched} at another nearby shop!`}
                      </div>
                      <p className="text-xs opacity-90 mt-0.5 leading-snug">
                        {comparison.currentShopIsCheapest
                          ? `This shop has the best rate among ${comparison.totalSellers} nearby stores.`
                          : `Prices start at ₹${comparison.lowestPrice} across ${comparison.totalSellers} local shops.`}
                      </p>
                    </div>
                  </div>

                  <a
                    href="#multi-shop-comparison"
                    className={`px-4 py-2 rounded-xl text-xs font-black transition shrink-0 flex items-center justify-center gap-1.5 shadow-xs ${
                      comparison.currentShopIsCheapest
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    <span>Compare All ({comparison.totalSellers})</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                Product Details
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {product.description || 'Freshly procured from verified neighborhood markets.'}
              </p>
            </div>

            {/* Current Shop Info */}
            <div className="p-4 rounded-2xl glass-panel bg-stone-50/70 border border-stone-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                    <Store size={22} />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Currently Selected Merchant</div>
                    <Link
                      to={`/shops/${product.shop_id}`}
                      className="text-sm font-bold text-stone-900 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <span>{product.shop_name}</span>
                      <ArrowRight size={13} />
                    </Link>
                    <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-emerald-600" />
                      <span>{product.shop_locality || 'Local Market'}</span>
                      <span>•</span>
                      <span>Delivery: ₹{product.delivery_charge || 25}</span>
                      <span>•</span>
                      <span>{product.estimated_delivery_time || '20-40 mins'}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/shops/${product.shop_id}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold glass-pill text-emerald-800 hover:bg-emerald-50 shrink-0"
                >
                  Visit Store
                </Link>
              </div>
            </div>

            {/* Add to Cart / Quantity selection */}
            <div className="pt-2">
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full py-3.5 rounded-2xl font-bold text-sm bg-stone-200 text-stone-400 cursor-not-allowed"
                >
                  Currently Out of Stock
                </button>
              ) : inCartQty > 0 ? (
                <div className="flex items-center justify-between p-2 rounded-2xl glass-pill border border-emerald-300">
                  <span className="text-xs font-bold text-emerald-900 px-3">
                    In Cart: {inCartQty} units
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(product.id, inCartQty - 1)}
                      className="w-9 h-9 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 flex items-center justify-center shadow-xs"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold text-sm text-stone-900 px-2">{inCartQty}</span>
                    <button
                      onClick={() => updateQuantity(product.id, inCartQty + 1)}
                      disabled={inCartQty >= available}
                      className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center justify-center shadow-xs"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center glass-pill rounded-2xl p-1 border border-stone-200">
                    <button
                      onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                      className="w-9 h-9 rounded-xl hover:bg-white text-stone-700 flex items-center justify-center"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="font-bold text-sm text-stone-900 px-3">{selectedQty}</span>
                    <button
                      onClick={() => setSelectedQty(Math.min(available, selectedQty + 1))}
                      className="w-9 h-9 rounded-xl hover:bg-white text-stone-700 flex items-center justify-center"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <button
                    onClick={() => addToCart(product, selectedQty)}
                    className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2"
                    id="product-add-cart-btn"
                  >
                    <ShoppingBag size={18} />
                    <span>Add {selectedQty} to Cart (₹{product.price * selectedQty})</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* FULL MULTI-SHOP PRICE COMPARISON SECTION */}
      <section
        id="multi-shop-comparison"
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl space-y-6 scroll-mt-24"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
              <Layers size={13} />
              <span>Multi-Shop Price Comparison</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              Prices for "{product.name}" in Other Shops
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Compare prices, delivery charges, and timings across local stores before deciding where to buy
            </p>
          </div>

          {/* Sort Controls */}
          {allSellers.length > 1 && (
            <div className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-2xl text-xs font-bold text-stone-600 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setSortBy('price')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  sortBy === 'price' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-stone-900'
                }`}
              >
                Lowest Price
              </button>
              <button
                onClick={() => setSortBy('total')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  sortBy === 'total' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-stone-900'
                }`}
              >
                Price + Delivery
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  sortBy === 'rating' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-stone-900'
                }`}
              >
                Top Rated
              </button>
            </div>
          )}
        </div>

        {allSellers.length > 0 ? (
          <div className="space-y-4">
            {/* Comparison Highlights Banner */}
            {comparison && comparison.maxSavings > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-900">
                      Smart Shopper Savings: Save up to ₹{comparison.maxSavings}!
                    </span>
                    <p className="text-[11px] text-stone-600">
                      Lowest store price is ₹{comparison.lowestPrice} vs ₹{comparison.highestPrice} highest local price.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-emerald-100 text-emerald-800">
                    {allSellers.length} Shops Compared
                  </span>
                </div>
              </div>
            )}

            {/* Comparison Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedSellers.map((seller) => {
                const isCurrentProduct = seller.product_id === product.id;
                const isLowest = seller.price === comparison?.lowestPrice;
                const totalCost = seller.price + (seller.delivery_charge || 0);
                const inCart = isSellerInCart(seller.product_id);
                const isJustAdded = recentlyAddedId === seller.product_id;

                return (
                  <div
                    key={seller.product_id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                      isCurrentProduct
                        ? 'border-emerald-400 bg-emerald-50/20 ring-2 ring-emerald-500/20 shadow-md'
                        : isLowest
                        ? 'border-emerald-300 bg-white hover:border-emerald-400 shadow-sm'
                        : 'border-stone-200/80 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div>
                      {/* Card Header: Shop Name & Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              to={`/shops/${seller.shop_id}`}
                              className="font-black text-base text-stone-900 hover:text-emerald-700 flex items-center gap-1.5"
                            >
                              <Store size={16} className="text-emerald-700 shrink-0" />
                              <span>{seller.shop_name}</span>
                            </Link>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-stone-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-stone-700">
                              <MapPin size={12} className="text-emerald-600" />
                              {seller.shop_locality}
                            </span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <RatingStars rating={seller.shop_rating} size={11} />
                              <span className="font-bold text-stone-700">{seller.shop_rating}</span>
                              {seller.shop_review_count !== undefined && (
                                <span className="text-stone-400">({seller.shop_review_count})</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {isLowest && (
                            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-emerald-600 text-white shadow-xs">
                              🏆 Lowest Price
                            </span>
                          )}
                          {isCurrentProduct && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                              Selected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pricing Breakdown Card */}
                      <div className="p-3 rounded-2xl bg-stone-50/80 border border-stone-100 my-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-medium">Item Price ({seller.unit})</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-black text-stone-900">
                              ₹{seller.price}
                            </span>
                            {seller.mrp && seller.mrp > seller.price && (
                              <span className="text-xs text-stone-400 line-through">
                                ₹{seller.mrp}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-stone-500">
                          <span className="flex items-center gap-1">
                            <Truck size={12} className="text-stone-400" />
                            Delivery Charge
                          </span>
                          <span className="font-bold text-stone-800">
                            {seller.delivery_charge ? `₹${seller.delivery_charge}` : 'FREE'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-stone-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-stone-400" />
                            Estimated Time
                          </span>
                          <span className="font-semibold text-stone-800">
                            {seller.estimated_delivery_time || '20-40 mins'}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between font-black text-stone-900">
                          <span>Total (Item + Delivery)</span>
                          <span className="text-sm font-extrabold text-emerald-800">
                            ₹{totalCost}
                          </span>
                        </div>
                      </div>

                      {/* Stock availability */}
                      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                        <span className="flex items-center gap-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              seller.available_stock > 0 ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          <span>{seller.available_stock > 0 ? `${seller.available_stock} in stock` : 'Out of stock'}</span>
                        </span>

                        {seller.savingsVsHighest && seller.savingsVsHighest > 0 ? (
                          <span className="font-bold text-emerald-700">
                            Save ₹{seller.savingsVsHighest} vs max price
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                      {!isCurrentProduct ? (
                        <Link
                          to={`/products/${seller.product_id}`}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 transition flex items-center gap-1"
                        >
                          <span>Switch to this store</span>
                          <ArrowRight size={13} />
                        </Link>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 px-2 flex items-center gap-1">
                          <Check size={14} />
                          <span>Currently viewing</span>
                        </span>
                      )}

                      <button
                        onClick={() => handleAddSellerToCart(seller)}
                        disabled={seller.available_stock <= 0}
                        className={`py-2 px-4 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 ${
                          isJustAdded
                            ? 'bg-emerald-600 text-white'
                            : inCart
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : isLowest
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-stone-900 hover:bg-emerald-800 text-white'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Added!</span>
                          </>
                        ) : inCart ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>In Cart</span>
                          </>
                        ) : (
                          <>
                            <Plus size={13} />
                            <span>Add from this Shop</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-3xl glass-pill text-center text-xs text-stone-500 space-y-2">
            <Info size={24} className="mx-auto text-stone-400" />
            <p className="font-bold text-stone-800">Exclusive Local Offer</p>
            <p>This authentic item is currently stocked exclusively at {product.shop_name}.</p>
          </div>
        )}
      </section>

      {/* REVIEWS SECTION */}
      {reviews.length > 0 && (
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl space-y-5">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-emerald-700" />
            <h2 className="text-lg font-bold text-stone-900">
              Verified Customer Reviews ({reviews.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl glass-panel bg-stone-50/60 border border-stone-100 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">{rev.customer_name}</span>
                  <RatingStars rating={rev.rating} size={12} />
                </div>
                <p className="text-xs text-stone-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
                <div className="text-[10px] text-stone-400">
                  {new Date(rev.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
