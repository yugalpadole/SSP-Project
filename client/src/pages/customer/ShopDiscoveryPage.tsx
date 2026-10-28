import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Filter, Store, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { Shop } from '../../types';
import { ShopCard } from '../../components/customer/ShopCard';
import { useLocation, POPULAR_LOCALITIES } from '../../context/LocationContext';
import { SEO } from '../../components/common/SEO';

export const ShopDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentLocality } = useLocation();

  const [shops, setShops] = useState<Shop[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedLocality, setSelectedLocality] = useState(searchParams.get('locality') || currentLocality.name);
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
    const fetchShops = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.append('search', searchTerm.trim());
        if (selectedCategory !== 'All') params.append('category', selectedCategory);
        if (selectedLocality !== 'All') params.append('locality', selectedLocality);

        const res = await fetch(`/api/shops?${params.toString()}`);
        const data = await res.json();
        setShops(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch shops', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, [searchTerm, selectedCategory, selectedLocality]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLocality('All');
  };

  return (
    <div className="space-y-8 pb-16">
      <SEO
        title="Discover Neighborhood Shops"
        description="Browse verified local shopkeepers in your area, check live store inventory, and reserve items for instant pickup."
      />
      
      {/* Page Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
            <Store size={13} />
            <span>Local Market Directory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Discover Verified Neighborhood Shops
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Browse genuine local storekeepers, check delivery availability, reserve products, or contact directly on WhatsApp.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3 pt-4 border-t border-stone-200/60">
          
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by shop name, landmark..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl"
              id="shop-search-input"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-input w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl"
              id="shop-category-select"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Shop Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Locality Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="glass-input w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl"
              id="shop-locality-select"
            >
              <option value="All">All Localities</option>
              {POPULAR_LOCALITIES.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Pills */}
        {(selectedCategory !== 'All' || selectedLocality !== 'All' || searchTerm) && (
          <div className="flex items-center gap-2 mt-3 pt-2 text-xs">
            <span className="text-stone-400 font-semibold">Active filters:</span>
            {searchTerm && (
              <span className="px-2.5 py-0.5 rounded-full glass-pill text-stone-700 font-medium">
                "{searchTerm}"
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                {selectedCategory}
              </span>
            )}
            {selectedLocality !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                {selectedLocality}
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs text-red-600 hover:underline font-semibold ml-2 flex items-center gap-1"
            >
              <RefreshCw size={11} />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Shop Results List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
            {isLoading ? 'Searching Shops...' : `Found ${shops.length} Local Shops`}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel h-80 rounded-2xl animate-pulse bg-white/40" />
            ))}
          </div>
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto">
            <Store size={40} className="mx-auto text-stone-400 mb-3" />
            <h3 className="font-bold text-base text-stone-800">No shops matched your filters</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              Try changing the locality or category to view more nearby neighborhood stores.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
