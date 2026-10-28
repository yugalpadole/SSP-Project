import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Layers,
  Store,
  CheckCircle,
  RefreshCw,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../../components/customer/ProductCard';
import { useLocation, POPULAR_LOCALITIES } from '../../context/LocationContext';
import { SEO } from '../../components/common/SEO';

export const ProductSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentLocality } = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedLocality, setSelectedLocality] = useState(searchParams.get('locality') || currentLocality.name);
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'popular'>('popular');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    'All',
    'Groceries',
    'Fruits & Vegetables',
    'Electronics',
    'Fashion',
    'Stationery',
    'Personal Care',
    'Home Essentials',
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.append('search', searchTerm.trim());
        if (selectedCategory !== 'All') params.append('category', selectedCategory);
        if (selectedLocality !== 'All') params.append('locality', selectedLocality);
        if (maxPrice < 1500) params.append('maxPrice', String(maxPrice));
        if (onlyInStock) params.append('inStock', 'true');

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        let items: Product[] = Array.isArray(data) ? data : [];

        // Client-side sorting
        if (sortBy === 'price_asc') {
          items.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_desc') {
          items.sort((a, b) => b.price - a.price);
        }

        setProducts(items);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedCategory, selectedLocality, maxPrice, onlyInStock, sortBy]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLocality('All');
    setMaxPrice(1500);
    setOnlyInStock(false);
    setSortBy('popular');
  };

  return (
    <div className="space-y-8 pb-16">
      <SEO
        title="Compare Products & Prices"
        description="Search products, compare live prices across local shops, and check real-time neighborhood stock."
      />
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider mb-2">
            <Layers size={13} />
            <span>Multi-Shop Price Comparison</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Compare Products & Prices Across Local Markets
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Check real-time stock and prices across neighborhood shops before you reserve or order.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-6 pt-5 border-t border-stone-200/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl"
              id="product-search-input"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-input w-full px-3 py-2 text-xs sm:text-sm rounded-xl"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Locality */}
          <div>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="glass-input w-full px-3 py-2 text-xs sm:text-sm rounded-xl"
            >
              <option value="All">All Localities</option>
              {POPULAR_LOCALITIES.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="glass-input w-full px-3 py-2 text-xs sm:text-sm rounded-xl"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Price Slider & In-Stock Checkbox */}
        <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-stone-700">Max Price: ₹{maxPrice}</span>
            <input
              type="range"
              min="20"
              max="1500"
              step="20"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-32 accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
              />
              <span className="font-semibold text-stone-700">In-Stock Only</span>
            </label>

            {(searchTerm || selectedCategory !== 'All' || selectedLocality !== 'All' || maxPrice < 1500 || onlyInStock) && (
              <button
                onClick={handleReset}
                className="text-xs text-red-600 hover:underline font-semibold flex items-center gap-1"
              >
                <RefreshCw size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Tip Box */}
      <div className="p-4 rounded-2xl glass-panel bg-amber-50/60 border border-amber-200/60 flex items-center gap-3 text-xs text-amber-900">
        <Sparkles size={18} className="text-amber-600 shrink-0" />
        <span>
          <strong>Pro-Tip:</strong> Click on any product to see which other shops in your area sell the exact same item and compare their rates & delivery times side-by-side!
        </span>
      </div>

      {/* Product Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
            {isLoading ? 'Searching...' : `Found ${products.length} Products`}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="glass-panel h-64 rounded-2xl animate-pulse bg-white/40" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto">
            <Search size={40} className="mx-auto text-stone-400 mb-3" />
            <h3 className="font-bold text-base text-stone-800">No products found</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              Try adjusting your search terms or increasing the price filter.
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
