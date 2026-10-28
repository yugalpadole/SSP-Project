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
  ChevronRight
} from 'lucide-react';
import { Product, Review } from '../../types';
import { useCart } from '../../context/CartContext';
import { RatingStars } from '../../components/common/RatingStars';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { items, addToCart, updateQuantity } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [otherSellers, setOtherSellers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedQty, setSelectedQty] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data.product);
          setOtherSellers(data.otherSellers || []);
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
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-semibold">Loading product details...</p>
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

  return (
    <div className="space-y-12 pb-16">
      
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
        <div className="lg:col-span-5">
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
          </div>
        </div>

        {/* Right: Info, Price, Seller, Add To Cart */}
        <div className="lg:col-span-7 space-y-6">
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
            <div className="p-4 rounded-2xl glass-pill bg-white/60 border border-emerald-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-stone-400 uppercase font-bold">Local Market Price</div>
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

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                Product Details
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {product.description || 'Freshly procured from verified neighborhood markets.'}
              </p>
            </div>

            {/* Sold By Shop Card */}
            <div className="p-4 rounded-2xl glass-panel bg-stone-50/60 border border-stone-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <Store size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Sold by local merchant</div>
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
                    </div>
                  </div>
                </div>

                <Link
                  to={`/shops/${product.shop_id}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold glass-pill text-emerald-800 hover:bg-emerald-50"
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

      {/* MULTI-SHOP PRICE COMPARISON SECTION */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider mb-1">
              <Layers size={13} />
              <span>Multi-Shop Comparison</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900">
              Other Nearby Shops Selling Similar Items
            </h2>
            <p className="text-xs text-stone-500">Compare prices and delivery terms before making your choice</p>
          </div>
        </div>

        {otherSellers.length > 0 ? (
          <div className="divide-y divide-stone-200/60 pt-2">
            {otherSellers.map((seller) => (
              <div
                key={seller.product_id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-emerald-50/30 p-3 rounded-2xl transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white shadow-xs border border-stone-200">
                    <Store size={20} className="text-emerald-700" />
                  </div>
                  <div>
                    <Link
                      to={`/shops/${seller.shop_id}`}
                      className="font-bold text-sm text-stone-900 hover:text-emerald-700"
                    >
                      {seller.shop_name}
                    </Link>
                    <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin size={12} className="text-emerald-600" />
                      <span>{seller.shop_locality}</span>
                      <span>•</span>
                      <span>Delivery: ₹{seller.delivery_charge || 25}</span>
                      <span>•</span>
                      <span className={seller.available_stock > 0 ? 'text-emerald-700 font-semibold' : 'text-red-600'}>
                        {seller.available_stock > 0 ? `${seller.available_stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <div className="text-base font-extrabold text-stone-900">
                      ₹{seller.price}
                    </div>
                    <span className="text-[11px] text-stone-400">{seller.unit}</span>
                  </div>

                  <Link
                    to={`/products/${seller.product_id}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-600 hover:text-white transition shadow-xs"
                  >
                    View Offer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl glass-pill text-center text-xs text-stone-500">
            No other nearby shops currently list this exact item. You are viewing the best local rate!
          </div>
        )}
      </section>

    </div>
  );
};
