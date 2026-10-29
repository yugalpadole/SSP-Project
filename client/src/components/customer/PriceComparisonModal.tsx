import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Store,
  MapPin,
  Truck,
  Clock,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  Percent,
  Plus
} from 'lucide-react';
import { ProductSeller, ProductComparison, Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { RatingStars } from '../common/RatingStars';

interface PriceComparisonModalProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Product;
}

export const PriceComparisonModal: React.FC<PriceComparisonModalProps> = ({
  productId,
  isOpen,
  onClose,
  initialProduct,
}) => {
  const { addToCart, items } = useCart();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [comparison, setComparison] = useState<ProductComparison | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'total' | 'delivery' | 'rating'>('price');
  const [addedShopId, setAddedShopId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.product) {
          setProduct(data.product);
        }
        if (data.comparison) {
          setComparison(data.comparison);
        }
      })
      .catch((err) => console.error('Failed to load comparison data', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, isOpen]);

  if (!isOpen) return null;

  const sellers = comparison?.allSellers || [];

  // Sort sellers according to user selection
  const sortedSellers = [...sellers].sort((a, b) => {
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

  const handleAddToCart = (seller: ProductSeller) => {
    // Construct product object for cart
    const prod: Product = {
      id: seller.product_id,
      shop_id: seller.shop_id,
      category_id: product?.category_id || 1,
      name: seller.product_name,
      slug: seller.shop_slug,
      description: product?.description || '',
      price: seller.price,
      mrp: seller.mrp,
      unit: seller.unit,
      image_url: seller.image_url || product?.image_url || '',
      stock_quantity: seller.available_stock,
      reserved_quantity: 0,
      available_stock: seller.available_stock,
      is_active: 1,
      shop_name: seller.shop_name,
      shop_locality: seller.shop_locality,
      delivery_charge: seller.delivery_charge,
      estimated_delivery_time: seller.estimated_delivery_time,
    };

    const added = addToCart(prod, 1);
    if (added) {
      setAddedShopId(seller.shop_id);
      setTimeout(() => setAddedShopId(null), 2000);
    }
  };

  const isItemInCart = (prodId: number) => items.some((i) => i.product.id === prodId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-stone-100 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-start justify-between gap-4 bg-gradient-to-r from-emerald-50/50 via-white to-amber-50/30">
          <div className="flex items-center gap-3 min-w-0">
            {product?.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-14 h-14 rounded-2xl object-cover border border-stone-200/80 shadow-xs shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-1">
                <Sparkles size={11} />
                <span>Multi-Shop Price Comparison</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 truncate">
                {product?.name || 'Product Comparison'}
              </h2>
              <p className="text-xs text-stone-500">
                Unit: <span className="font-semibold text-stone-700">{product?.unit || '1 unit'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition shrink-0"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500 font-semibold">Comparing local shop offers...</p>
            </div>
          ) : sellers.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              No price comparison data available for this item.
            </div>
          ) : (
            <>
              {/* Savings Highlight Card */}
              {comparison && comparison.maxSavings > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/15 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-emerald-100 flex items-center gap-1.5 uppercase tracking-wider">
                      <TrendingDown size={14} />
                      <span>Best Local Market Price</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black">
                      Save up to ₹{comparison.maxSavings}!
                    </div>
                    <p className="text-xs text-emerald-100/90 leading-tight">
                      Prices range from <strong>₹{comparison.lowestPrice}</strong> to <strong>₹{comparison.highestPrice}</strong> across {sellers.length} neighborhood stores.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-white text-emerald-800 shadow-sm inline-block">
                      {Math.round((comparison.maxSavings / comparison.highestPrice) * 100)}% Cheaper
                    </span>
                  </div>
                </div>
              )}

              {/* Sort Tabs */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-b border-stone-100 pb-3">
                <span className="text-xs font-bold text-stone-500">
                  {sellers.length} Shops Selling This Item:
                </span>
                <div className="flex items-center gap-1 bg-stone-100/80 p-1 rounded-xl text-[11px] font-bold text-stone-600">
                  <button
                    onClick={() => setSortBy('price')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      sortBy === 'price' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-stone-900'
                    }`}
                  >
                    Lowest Price
                  </button>
                  <button
                    onClick={() => setSortBy('total')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      sortBy === 'total' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-stone-900'
                    }`}
                  >
                    Price + Delivery
                  </button>
                  <button
                    onClick={() => setSortBy('rating')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      sortBy === 'rating' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-stone-900'
                    }`}
                  >
                    Top Rated
                  </button>
                </div>
              </div>

              {/* Sellers List */}
              <div className="space-y-3">
                {sortedSellers.map((seller, idx) => {
                  const isLowest = seller.price === comparison?.lowestPrice;
                  const totalCost = seller.price + (seller.delivery_charge || 0);
                  const inCart = isItemInCart(seller.product_id);
                  const isJustAdded = addedShopId === seller.shop_id;

                  return (
                    <div
                      key={seller.product_id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isLowest
                          ? 'border-emerald-300 bg-emerald-50/40 shadow-sm'
                          : 'border-stone-200/80 bg-white hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Shop Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black text-stone-900">
                              {seller.shop_name}
                            </span>
                            {isLowest && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-600 text-white shadow-xs">
                                🏆 Best Price
                              </span>
                            )}
                            {seller.isCurrent && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700">
                                Current
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin size={12} className="text-emerald-600" />
                              {seller.shop_locality}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Truck size={12} className="text-stone-400" />
                              ₹{seller.delivery_charge} delivery
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-stone-400" />
                              {seller.estimated_delivery_time}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-0.5">
                            <RatingStars rating={seller.shop_rating} size={12} />
                            <span className="text-[11px] font-bold text-stone-700">
                              {seller.shop_rating}
                            </span>
                            {seller.shop_review_count !== undefined && (
                              <span className="text-[11px] text-stone-400">
                                ({seller.shop_review_count} reviews)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                          <div className="text-left sm:text-right">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-black text-stone-900">
                                ₹{seller.price}
                              </span>
                              {seller.mrp && seller.mrp > seller.price && (
                                <span className="text-xs text-stone-400 line-through">
                                  ₹{seller.mrp}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-500 font-medium">
                              Total: ₹{totalCost} (incl. delivery)
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/products/${seller.product_id}`}
                              onClick={onClose}
                              className="p-2 rounded-xl text-xs font-bold text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                              title="View full details"
                            >
                              <ExternalLink size={15} />
                            </Link>

                            <button
                              onClick={() => handleAddToCart(seller)}
                              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
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
                                  <span>Add to Cart</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>⚡ Prices updated real-time by verified neighborhood shops</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-bold text-stone-700 hover:bg-stone-200/60 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
