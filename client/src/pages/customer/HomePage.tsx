import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ArrowRight,
  Sparkles,
  Store,
  Clock,
  ShieldCheck,
  TrendingUp,
  Flame,
  ChevronRight,
  ShoppingBag,
  Apple,
  Shirt,
  Smartphone,
  BookOpen,
  Heart,
  Home,
  CheckCircle2,
  Layers,
  ThumbsUp,
  BadgePercent,
  Truck,
  Users,
  Check,
  Zap,
  Star,
  Quote,
  Percent
} from 'lucide-react';
import { Product, Shop, Category } from '../../types';
import { ProductCard } from '../../components/customer/ProductCard';
import { ShopCard } from '../../components/customer/ShopCard';
import { useLocation } from '../../context/LocationContext';
import { SEO } from '../../components/common/SEO';

export const HomePage: React.FC = () => {
  const { currentLocality, setIsPickerOpen } = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [suggestedShops, setSuggestedShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Interactive Price Comparison Showcase State
  const [activeComparisonIndex, setActiveComparisonIndex] = useState(0);

  const comparisonData = [
    {
      itemName: 'Farm Fresh Hybrid Tomatoes (1 kg)',
      category: 'Fruits & Vegetables',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
      typicalAppPrice: 48,
      shops: [
        { name: 'Sharma Fresh Veggies & Fruits', price: 32, stock: 'Fresh Stock (45 kg)', isBest: true, locality: 'Yevalewadi' },
        { name: 'Green Grocers Supermarket', price: 35, stock: 'Available (60 kg)', isBest: false, locality: 'Khadakwasla' },
      ],
      maxSavings: 'Save ₹16 (33% less than app prices)'
    },
    {
      itemName: 'Organic Sharbati Whole Wheat Atta (5 kg)',
      category: 'Daily Groceries',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
      typicalAppPrice: 290,
      shops: [
        { name: 'Green Grocers Supermarket', price: 255, stock: 'In Stock (24 bags)', isBest: true, locality: 'Khadakwasla' },
        { name: 'Sharma Fresh Veggies & Fruits', price: 260, stock: 'In Stock (18 bags)', isBest: false, locality: 'Yevalewadi' },
      ],
      maxSavings: 'Save ₹35 (12% less than app prices)'
    },
    {
      itemName: 'Himachal Royal Shimla Apples (1 kg)',
      category: 'Fruits & Vegetables',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
      typicalAppPrice: 195,
      shops: [
        { name: 'Sharma Fresh Veggies & Fruits', price: 160, stock: 'Crisp Harvest (20 kg)', isBest: true, locality: 'Yevalewadi' },
      ],
      maxSavings: 'Save ₹35 (18% less than app prices)'
    },
    {
      itemName: 'Braided 100W Fast Charging Cable',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1608248597359-59749fb8c130?auto=format&fit=crop&w=400&q=80',
      typicalAppPrice: 499,
      shops: [
        { name: 'City Electronics & Mobile Hub', price: 299, stock: 'In Stock (40 pcs)', isBest: true, locality: 'Wagholi' },
      ],
      maxSavings: 'Save ₹200 (40% less than app prices)'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catRes, prodRes, shopRes] = await Promise.all([
          fetch('/api/categories'),
          fetch(`/api/products?locality=${encodeURIComponent(currentLocality.name)}`),
          fetch(`/api/shops?locality=${encodeURIComponent(currentLocality.name)}`),
        ]);

        const catData = await catRes.json();
        const prodData = await prodRes.json();
        const shopData = await shopRes.json();

        setCategories(Array.isArray(catData) ? catData : []);
        const prods: Product[] = Array.isArray(prodData) ? prodData : [];
        setRecommendedProducts(prods.slice(0, 4));
        setPopularProducts(prods.slice(2, 6));

        // Find items with biggest discount for Deals section
        const sortedDeals = [...prods].sort((a, b) => {
          const discountA = a.mrp ? ((a.mrp - a.price) / a.mrp) : 0;
          const discountB = b.mrp ? ((b.mrp - b.price) / b.mrp) : 0;
          return discountB - discountA;
        });
        setDealProducts(sortedDeals.slice(0, 4));

        setSuggestedShops(Array.isArray(shopData) ? shopData.slice(0, 3) : []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentLocality.name]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Apple': return <Apple size={24} className="text-emerald-700" />;
      case 'ShoppingBag': return <ShoppingBag size={24} className="text-amber-700" />;
      case 'Shirt': return <Shirt size={24} className="text-rose-700" />;
      case 'Smartphone': return <Smartphone size={24} className="text-sky-700" />;
      case 'BookOpen': return <BookOpen size={24} className="text-indigo-700" />;
      case 'Heart': return <Heart size={24} className="text-pink-700" />;
      case 'Home': return <Home size={24} className="text-teal-700" />;
      default: return <Sparkles size={24} className="text-emerald-700" />;
    }
  };

  const currentComp = comparisonData[activeComparisonIndex];

  return (
    <div className="space-y-8 sm:space-y-10 pb-16">
      <SEO
        title="Local Market Shopping"
        description="Discover nearby neighborhood shops, compare product prices, check real-time stock, and choose fast home delivery or instant reserve & collect with eBazaar."
      />
      
      {/* 1. CLEAN MODERN SEARCH CONSOLE */}
      <section className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-3.5 sm:p-4 transition-all">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Main Search Input */}
          <form onSubmit={handleHeroSearch} className="relative flex items-center">
            <div className="relative w-full">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search fresh veggies, daily essentials, electronics, or local shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-24 sm:pr-28 py-3 rounded-xl text-xs sm:text-sm bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                id="homepage-search-input"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs flex items-center gap-1 cursor-pointer"
                id="homepage-search-submit"
              >
                <span>Search</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </form>

          {/* Quick Trending Keyword Tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <span className="font-semibold text-[11px] text-stone-400 uppercase tracking-wider shrink-0">Popular:</span>
            {['Fresh Tomatoes', 'Atta 5kg', 'Shimla Apples', 'Type-C Cable', 'Pure Cow Ghee'].map((item) => (
              <button
                key={item}
                onClick={() => navigate(`/products?search=${encodeURIComponent(item)}`)}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 text-stone-600 text-[11px] font-medium transition cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SHOWCASE */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
              Explore Categories
            </h2>
            <p className="text-xs text-stone-500">Browse everyday essentials by trade</p>
          </div>
          <Link
            to="/categories"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            <span>All Categories</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.slug}`}
              className="bg-white hover:bg-emerald-50/40 p-3.5 rounded-xl flex flex-col items-center text-center group border border-stone-200/80 hover:border-emerald-300 transition shadow-2xs hover:shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-stone-50 group-hover:scale-105 group-hover:bg-white transition-all flex items-center justify-center mb-2 border border-stone-200/60 shadow-2xs">
                {getCategoryIcon(cat.icon)}
              </div>
              <h3 className="font-bold text-xs text-stone-900 group-hover:text-emerald-700 transition line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[10px] text-stone-400 mt-0.5">
                {cat.product_count || 5}+ items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TODAY'S LOCAL DEALS */}
      {dealProducts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-rose-100 text-rose-600">
                <Flame size={16} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                  Today's Deals in {currentLocality.name}
                </h2>
                <p className="text-xs text-stone-500">Highest local savings and fresh morning arrivals</p>
              </div>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {dealProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 4. VERIFIED NEIGHBORHOOD SHOPS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-amber-100 text-amber-700">
              <Store size={16} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                Neighborhood Stores Near You
              </h2>
              <p className="text-xs text-stone-500">Verified community stores offering local delivery & reservations</p>
            </div>
          </div>
          <Link
            to="/shops"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            <span>Explore All Shops</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestedShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE LIVE PRICE COMPARISON (E-Bazaar Exclusive) */}
      <section className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/60 mb-1.5">
              <Layers size={12} className="text-emerald-600" />
              <span>Real-Time Price Transparency</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
              Compare Nearby Shops & Save
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              See live shelf rates from local stores compared to standard 10-minute delivery benchmarks.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition shrink-0"
          >
            <span>Compare All Products</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Tab Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {comparisonData.map((comp, idx) => (
            <button
              key={comp.itemName}
              onClick={() => setActiveComparisonIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer border ${
                activeComparisonIndex === idx
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              {comp.itemName.split(' (')[0]}
            </button>
          ))}
        </div>

        {/* Active Comparison Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-stone-50/70 p-4 sm:p-5 rounded-xl border border-stone-200">
          
          {/* Left: Product Info & Benchmark */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-3 border-b lg:border-b-0 lg:border-r border-stone-200 pb-4 lg:pb-0 lg:pr-5">
            <div className="space-y-2">
              <img
                src={currentComp.image}
                alt={currentComp.itemName}
                className="w-full h-36 object-cover rounded-xl border border-stone-200 shadow-2xs"
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                {currentComp.category}
              </span>
              <h3 className="text-sm font-bold text-stone-900 leading-snug">
                {currentComp.itemName}
              </h3>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-semibold flex items-center justify-between">
                <span>Typical 10-Min App Price:</span>
                <span className="line-through text-stone-400 font-normal">₹{currentComp.typicalAppPrice}</span>
              </div>
              <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>{currentComp.maxSavings}</span>
              </div>
            </div>
          </div>

          {/* Right: Nearby Shop Sellers Table */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <span>Nearby Local Sellers</span>
                <span>Live Shelf Price</span>
              </div>

              <div className="space-y-2">
                {currentComp.shops.map((shop) => (
                  <div
                    key={shop.name}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      shop.isBest
                        ? 'bg-white border-emerald-300 shadow-2xs ring-1 ring-emerald-500/20'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Store size={14} className={shop.isBest ? 'text-emerald-700' : 'text-stone-400'} />
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900">{shop.name}</h4>
                        {shop.isBest && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-600 text-white">
                            Best Rate
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-2">
                        <span>{shop.locality}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">{shop.stock}</span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="text-sm sm:text-base font-bold text-stone-900">₹{shop.price}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          Save ₹{currentComp.typicalAppPrice - shop.price}
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/products?search=${encodeURIComponent(currentComp.itemName.split(' (')[0])}`)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition cursor-pointer"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-stone-400 text-center lg:text-left">
              Prices updated directly by store owners. Reserve at this price online with zero fee and collect in 15 minutes!
            </p>
          </div>

        </div>
      </section>

      {/* 6. RECOMMENDED FRESH PICKS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                Recommended Fresh Picks
              </h2>
              <p className="text-xs text-stone-500">Popular items in {currentLocality.name} with real-time stock</p>
            </div>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. CLEAN VALUE PILLARS & TRUST (Consolidated, No Clutter) */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex flex-col items-center text-center space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-stone-900">100% Verified Stores</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Every shop is KYC-verified with real shelf stock.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-stone-900">Zero-Fee Reserve</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Reserve online for free; collect at the counter in 15 mins.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Truck size={20} />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-stone-900">Direct Shop Delivery</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Handled directly by neighborhood shopkeepers.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <BadgePercent size={20} />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-stone-900">Honest Shelf Rates</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Pay real mandi prices without aggregator surge markups.
            </p>
          </div>
        </div>

        {/* Minimalist Community Quote */}
        <div className="pt-5 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 bg-stone-50/70 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-stone-700 italic">
            <Quote size={15} className="text-emerald-600 shrink-0" />
            <span>"Saved over ₹1,200 on kitchen groceries last month comparing prices right from home."</span>
            <span className="font-semibold text-stone-900 not-italic">— Anita Sharma, Yevalewadi, Pune</span>
          </div>
          <div className="flex items-center gap-1 text-amber-500 shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} fill="currentColor" />
            ))}
            <span className="text-[11px] font-bold text-stone-700 ml-1">4.9 / 5</span>
          </div>
        </div>
      </section>

      {/* 8. MERCHANT INVITATION BANNER */}
      <section className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
            For Neighborhood Store Owners
          </span>
          <h3 className="text-xl font-bold tracking-tight">
            Bring your local shop online with E-Bazaar
          </h3>
          <p className="text-xs text-emerald-100 max-w-lg">
            Create your digital storefront in 2 minutes. Accept counter pickup reservations and connect directly with local shoppers.
          </p>
        </div>

        <Link
          to="/register"
          className="px-5 py-2.5 rounded-xl font-bold text-xs text-emerald-950 bg-white hover:bg-emerald-50 transition shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>Register as Shopkeeper</span>
          <ArrowRight size={14} />
        </Link>
      </section>

    </div>
  );
};
