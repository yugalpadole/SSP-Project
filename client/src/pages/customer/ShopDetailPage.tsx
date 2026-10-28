import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Truck,
  MessageSquare,
  Search,
  Store,
  Phone,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Shop, Product, Review } from '../../types';
import { ProductCard } from '../../components/customer/ProductCard';
import { RatingStars } from '../../components/common/RatingStars';

export const ShopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/shops/${id}`);
        const data = await res.json();
        if (res.ok) {
          setShop(data.shop);
          setProducts(data.products || []);
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error('Failed to load shop details', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-semibold">Loading shop storefront...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto my-12">
        <Store size={40} className="mx-auto text-stone-400 mb-3" />
        <h2 className="text-lg font-bold text-stone-900">Shop Not Found</h2>
        <p className="text-xs text-stone-500 mt-1 mb-4">The shop you are looking for may have been moved or updated.</p>
        <Link to="/shops" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600">
          Back to Shops Directory
        </Link>
      </div>
    );
  }

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || p.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories in this shop
  const shopCategories = ['All', ...Array.from(new Set(products.map((p) => p.category_name).filter(Boolean)))];

  // WhatsApp chat link
  const whatsappUrl = `https://wa.me/${shop.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello ${shop.name}! I am browsing your products on E-Bazaar and would like to check availability.`
  )}`;

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. SHOP HEADER & BANNER */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white shadow-xl">
        {/* Banner */}
        <div className="relative h-48 sm:h-64 overflow-hidden bg-stone-200">
          <img
            src={shop.banner_url || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80'}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

          {/* Quick Verified Badge */}
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-emerald-800 shadow">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Verified Neighborhood Merchant</span>
          </div>

          {/* Direct WhatsApp CTA Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 hover:scale-105"
            id="shop-whatsapp-cta"
          >
            <MessageSquare size={16} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* Shop Info Container */}
        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-4">
            
            {/* Logo and Titles */}
            <div className="flex items-end gap-4">
              <img
                src={shop.logo_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'}
                alt={shop.name}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl bg-white shrink-0"
              />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md inline-block mb-1">
                  {shop.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
                  {shop.name}
                </h1>
                <div className="mt-1">
                  <RatingStars rating={shop.rating || 4.8} count={shop.review_count || reviews.length} size={15} />
                </div>
              </div>
            </div>

            {/* Quick Phone Call */}
            {shop.phone && (
              <a
                href={`tel:${shop.phone}`}
                className="px-4 py-2 rounded-xl text-xs font-bold glass-pill text-stone-700 hover:bg-white flex items-center gap-2"
              >
                <Phone size={14} className="text-emerald-600" />
                <span>Call Store</span>
              </a>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl mb-5">
            {shop.description}
          </p>

          {/* Metadata Highlights Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-stone-200/60">
            <div className="flex items-center gap-2.5 text-xs text-stone-600">
              <MapPin size={16} className="text-emerald-600 shrink-0" />
              <span className="truncate">{shop.address}, {shop.locality}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-stone-600">
              <Clock size={16} className="text-amber-600 shrink-0" />
              <span>Hours: {shop.opening_hours || '8:00 AM - 9:30 PM'}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-stone-600">
              <Truck size={16} className="text-sky-600 shrink-0" />
              <span>
                {Boolean(shop.is_delivery_enabled)
                  ? `Delivery: ₹${shop.delivery_charge} • ${shop.estimated_delivery_time || '30 mins'}`
                  : 'Pickup / Reserve Only'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STOREFRONT PRODUCTS CATALOG */}
      <div className="space-y-6">
        
        {/* Search and Category Filter Header */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Products in Store ({filteredProducts.length})
            </h2>
            <p className="text-xs text-stone-500">Live inventory synced with physical storefront</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search within shop */}
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search products in this shop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-8 pr-3 py-1.5 text-xs rounded-xl"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5 overflow-x-auto">
              {shopCategories.map((cat: any) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'glass-pill text-stone-700 hover:bg-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  shop_name: shop.name,
                  shop_id: shop.id,
                }}
                showShopName={false}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-10 text-center rounded-2xl">
            <p className="text-xs text-stone-500">No products matching your search in this store.</p>
          </div>
        )}
      </div>

      {/* 3. STORE REVIEWS SECTION */}
      {reviews.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Customer Reviews & Ratings</h3>
              <p className="text-xs text-stone-500">Feedback from verified local shoppers</p>
            </div>
            <RatingStars rating={shop.rating || 4.8} count={reviews.length} size={16} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl glass-pill bg-white/70 border border-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-800">{rev.customer_name}</span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
                <RatingStars rating={rev.rating} size={12} />
                <p className="text-xs text-stone-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
