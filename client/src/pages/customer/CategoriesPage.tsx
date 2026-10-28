import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Grid,
  ShoppingBag,
  Apple,
  Shirt,
  Smartphone,
  BookOpen,
  Heart,
  Home,
  Store,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Category, Product, Shop } from '../../types';
import { ProductCard } from '../../components/customer/ProductCard';
import { ShopCard } from '../../components/customer/ShopCard';
import { SEO } from '../../components/common/SEO';

export const CategoriesPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // If a slug is present in URL, fetch products & shops for that category
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      if (!slug) {
        setSelectedCategory(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(`/api/categories/${slug}`);
        const data = await res.json();
        if (res.ok) {
          setSelectedCategory(data.category);
          setProducts(data.products || []);
          setShops(data.shops || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [slug]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Apple': return <Apple size={28} className="text-emerald-700" />;
      case 'ShoppingBag': return <ShoppingBag size={28} className="text-amber-700" />;
      case 'Shirt': return <Shirt size={28} className="text-rose-700" />;
      case 'Smartphone': return <Smartphone size={28} className="text-sky-700" />;
      case 'BookOpen': return <BookOpen size={28} className="text-indigo-700" />;
      case 'Heart': return <Heart size={28} className="text-pink-700" />;
      case 'Home': return <Home size={28} className="text-teal-700" />;
      default: return <Grid size={28} className="text-emerald-700" />;
    }
  };

  // If viewing a single category details page
  if (slug && selectedCategory) {
    return (
      <div className="space-y-10 pb-16">
        <SEO
          title={`${selectedCategory.name} - Local Categories`}
          description={selectedCategory.description || `Browse fresh ${selectedCategory.name} from local neighborhood stores on eBazaar.`}
        />
        {/* Category Header */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/80 shadow-md">
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-3">
            <Link to="/categories" className="hover:text-emerald-700 hover:underline">
              All Categories
            </Link>
            <ChevronRight size={13} />
            <span className="font-bold text-stone-800">{selectedCategory.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-xs">
                {getIcon(selectedCategory.icon)}
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
                  {selectedCategory.name}
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
                  {selectedCategory.description}
                </p>
              </div>
            </div>

            <Link
              to="/categories"
              className="px-4 py-2 rounded-xl text-xs font-bold glass-pill text-stone-700 hover:bg-white flex items-center gap-1.5"
            >
              <span>View Other Categories</span>
            </Link>
          </div>
        </div>

        {/* Products in this category */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900">
              Products in {selectedCategory.name} ({products.length})
            </h2>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-8 text-center rounded-2xl">
              <p className="text-xs text-stone-500">No products currently available in this category.</p>
            </div>
          )}
        </section>

        {/* Local Shops selling this category */}
        {shops.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-stone-200/60">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Store size={20} className="text-emerald-600" />
              <span>Nearby Shops Selling {selectedCategory.name}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {shops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // Categories Overview Page
  return (
    <div className="space-y-10 pb-16">
      <SEO
        title="Product Categories"
        description="Explore local shopping categories on eBazaar: Groceries, Fresh Produce, Electronics, Fashion, and Daily Essentials."
      />
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/80 shadow-md">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
            <Grid size={13} />
            <span>Market Departments</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Explore All Local Categories
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            From daily farm veggies and groceries to stationery and electronics, discover neighborhood merchants categorized by trade.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/categories/${cat.slug}`}
            className="glass-panel glass-card-hover p-6 rounded-3xl border border-white flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white transition flex items-center justify-center shadow-xs">
                  {getIcon(cat.icon)}
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold glass-pill text-stone-600">
                  {cat.product_count || 5}+ Items
                </span>
              </div>

              <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition">
                {cat.name}
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {cat.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-stone-200/60 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Browse Category</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
