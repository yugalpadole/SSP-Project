import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ShieldCheck, Clock, MapPin, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-emerald-900/10 bg-gradient-to-b from-stone-50/60 to-emerald-50/40 text-stone-700">
      {/* Value Badges Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-stone-200/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
              <Store size={26} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-900">100% Verified Local Shops</h4>
              <p className="text-xs text-stone-500">Shop straight from your trusted neighborhood storekeepers.</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-700">
              <Clock size={26} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-900">Instant Reserve & Collect</h4>
              <p className="text-xs text-stone-500">Lock in your products online with zero fee and pickup on your own time.</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-teal-100 text-teal-700">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-900">Transparent Price Comparison</h4>
              <p className="text-xs text-stone-500">Compare prices across nearby markets to get the freshest produce at the best rate.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & SEO content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & About */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="inline-block">
              <img src="/name.png" alt="eBazaar" className="h-9 w-auto" />
            </Link>
            <p className="text-xs text-stone-600 leading-relaxed">
              E-Bazaar connects neighborhood customers directly with local mom-and-pop shops, fresh mandi merchants, and artisanal storekeepers.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/60">
              <Sparkles size={12} className="text-emerald-600" />
              <span>Support Local • Buy Fresh</span>
            </div>
          </div>

          {/* Customer Links */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-stone-900 mb-3">Explore Markets</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/shops" className="hover:text-emerald-700 transition">Discover Local Shops</Link></li>
              <li><Link to="/products" className="hover:text-emerald-700 transition">Compare Product Prices</Link></li>
              <li><Link to="/categories" className="hover:text-emerald-700 transition">Browse All Categories</Link></li>
              <li><Link to="/orders" className="hover:text-emerald-700 transition">Track Orders & Pickups</Link></li>
              <li><Link to="/cart" className="hover:text-emerald-700 transition">My Shopping Cart</Link></li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-stone-900 mb-3">Popular Categories</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/categories/fruits-and-vegetables" className="hover:text-emerald-700 transition">Fruits & Vegetables</Link></li>
              <li><Link to="/categories/groceries" className="hover:text-emerald-700 transition">Daily Groceries & Staples</Link></li>
              <li><Link to="/categories/electronics" className="hover:text-emerald-700 transition">Electronics & Accessories</Link></li>
              <li><Link to="/categories/personal-care" className="hover:text-emerald-700 transition">Personal Care & Wellness</Link></li>
              <li><Link to="/categories/home-essentials" className="hover:text-emerald-700 transition">Home & Kitchen Essentials</Link></li>
            </ul>
          </div>

          {/* Active Localities */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-stone-900 mb-3">Serviceable Localities</h5>
            <div className="flex flex-wrap gap-1.5">
              {['Yevalewadi', 'Khadakwasla', 'Wagholi', 'Uruli Kanchan', 'Undri & Pisoli', 'Pirangut', 'Alandi Rural', 'Dhayari Gaon', 'Khed Shivapur', 'Saswad Rural'].map((loc) => (
                <span
                  key={loc}
                  className="px-2.5 py-1 rounded-lg text-[11px] glass-pill text-stone-600 border border-stone-200"
                >
                  {loc}
                </span>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-stone-200/50">
              <Link
                to="/register"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Are you a shopkeeper? List your store free →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div>
            © {new Date().getFullYear()} E-Bazaar. All rights reserved. Connecting Local Markets Digitally.
          </div>
          <div className="flex items-center gap-1 text-stone-500">
            <span>Crafted for local communities with</span>
            <Heart size={13} className="text-red-500 fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
