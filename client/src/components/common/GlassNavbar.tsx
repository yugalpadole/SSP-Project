import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  User as UserIcon,
  Store,
  Menu,
  X,
  ChevronDown,
  LogOut,
  PackageCheck,
  Grid,
  Layers,
  Sparkles,
  Home as HomeIcon,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';

export const GlassNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems, subtotal } = useCart();
  const { currentLocality, setIsPickerOpen } = useLocation();
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = React.useRef<HTMLDivElement>(null);

  // Click outside to close profile dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Explore Shops', path: '/shops', icon: Store },
    { name: 'Compare Prices', path: '/products', icon: Layers },
    { name: 'Categories', path: '/categories', icon: Grid },
    { name: 'My Orders', path: '/orders', icon: PackageCheck },
  ];

  const quickCategories = [
    { name: 'All Categories', path: '/categories' },
    { name: 'Fruits & Veggies', path: '/categories/fruits-and-vegetables' },
    { name: 'Daily Groceries', path: '/categories/groceries' },
    { name: 'Electronics', path: '/categories/electronics' },
    { name: 'Fashion', path: '/categories/fashion' },
    { name: 'Personal Care', path: '/categories/personal-care' },
    { name: 'Home Essentials', path: '/categories/home-essentials' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && routerLocation.pathname === '/') return true;
    if (path !== '/' && routerLocation.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-navbar border-b border-stone-200/70 transition-all backdrop-blur-xl bg-white/85 shadow-xs">
      
      {/* 1. PRIMARY MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4 lg:gap-8">
          
          {/* Brand Logo & Location Selector */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            {/* Clean E-Bazaar Typographic Wordmark Logo */}
            <Link
              to="/"
              className="flex items-center group py-1"
              id="navbar-brand-logo"
              title="E-Bazaar Home"
            >
              <img
                src="/name.png"
                alt="eBazaar"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-102"
              />
            </Link>

            {/* Quick Locality / PIN Code Selector Chip */}
            <button
              onClick={() => setIsPickerOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl glass-pill hover:bg-white text-stone-800 text-xs font-medium transition cursor-pointer border border-emerald-200/70 shadow-xs"
              title="Change Delivery Locality"
              id="navbar-location-selector"
            >
              <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-emerald-500/15 text-emerald-700">
                <MapPin size={15} />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
              </div>
              <div className="text-left leading-tight">
                <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Delivery To</div>
                <div className="text-xs font-extrabold text-stone-900 flex items-center gap-1">
                  <span className="max-w-[110px] sm:max-w-[140px] truncate">{currentLocality.name}</span>
                  <span className="text-[11px] text-stone-400 font-normal">({currentLocality.pincode})</span>
                  <ChevronDown size={13} className="text-stone-400 ml-0.5" />
                </div>
              </div>
            </button>
          </div>

          {/* Navigation Action Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-700 hover:text-emerald-800 hover:bg-emerald-50/70'
                  }`}
                >
                  <Icon size={15} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons: Cart & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Return to Homepage Button (Visible when browsing any sub-page) */}
            {routerLocation.pathname !== '/' && (
              <Link
                to="/"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 transition-all hover:scale-102 shadow-xs"
                id="nav-return-homepage-button"
                title="Return to Homepage"
              >
                <ArrowLeft size={13} className="text-emerald-700" />
                <HomeIcon size={14} className="text-emerald-700" />
                <span>Return to Homepage</span>
              </Link>
            )}

            {/* Quick-Commerce Basket Button with Count & Price */}
            <Link
              to="/cart"
              className="relative px-3.5 py-2 rounded-2xl glass-pill bg-white hover:bg-emerald-50 text-stone-800 transition flex items-center gap-2.5 border border-emerald-300/80 shadow-xs group"
              id="navbar-cart-button"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingBag size={20} className="text-emerald-700 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[10px] font-black h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-[10px] font-bold uppercase text-stone-400">My Basket</div>
                <div className="text-xs font-black text-stone-900">
                  {totalItems > 0 ? `₹${subtotal}` : 'Empty'}
                </div>
              </div>
            </Link>

            {/* Direct Shopkeeper Portal Button */}
            {user?.role === 'shopkeeper' && (
              <Link
                to="/shopkeeper/dashboard"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-xs transition"
                id="nav-shopkeeper-portal-btn"
                title="Go to Shopkeeper Dashboard"
              >
                <Store size={14} className="text-amber-800" />
                <span>My Store Portal</span>
              </Link>
            )}

            {/* User Profile / Auth Actions */}
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl glass-pill bg-white hover:bg-stone-50 transition border border-stone-200/80 cursor-pointer"
                  id="navbar-user-dropdown"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                  />
                  <div className="hidden sm:block text-left leading-tight">
                    <div className="text-xs font-bold text-stone-900 truncate max-w-[90px]">
                      {user.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-extrabold uppercase">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 glass-panel-elevated rounded-2xl p-2 shadow-2xl z-50 text-stone-800 animate-in fade-in"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <div className="p-3 border-b border-stone-200/60 mb-1">
                      <div className="text-xs font-bold text-stone-900">{user.name}</div>
                      <div className="text-[11px] text-stone-400 truncate">{user.email}</div>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-emerald-50 text-stone-700 hover:text-emerald-700"
                    >
                      <UserIcon size={15} />
                      <span>My Profile & Addresses</span>
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-emerald-50 text-stone-700 hover:text-emerald-700"
                    >
                      <PackageCheck size={15} />
                      <span>Orders & Reservations</span>
                    </Link>

                    {user.role === 'shopkeeper' ? (
                      <Link
                        to="/shopkeeper/dashboard"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 transition"
                      >
                        <Store size={15} className="text-amber-700" />
                        <span>Go to Shopkeeper Dashboard</span>
                      </Link>
                    ) : (
                      <Link
                        to="/register"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-emerald-50 text-emerald-800 transition"
                      >
                        <Store size={15} className="text-emerald-700" />
                        <span>Register as Shopkeeper</span>
                      </Link>
                    )}

                    <div className="border-t border-stone-200/60 my-1" />

                    <button
                      onClick={logout}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-red-50 text-red-600 transition cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 glass-pill hover:bg-emerald-50 transition border border-emerald-200"
                  id="navbar-signin-link"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
                  id="navbar-register-link"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl glass-pill text-stone-700 hover:bg-white"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. SECONDARY QUICK-ACCESS CATEGORIES SUB-NAVBAR */}
      <div className="hidden md:block border-t border-stone-200/60 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 overflow-x-auto text-xs font-semibold text-stone-600">
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {quickCategories.map((cat) => {
                const active = routerLocation.pathname === cat.path;
                return (
                  <Link
                    key={cat.path}
                    to={cat.path}
                    className={`px-3 py-1 rounded-xl transition whitespace-nowrap text-xs ${
                      active
                        ? 'bg-emerald-100 text-emerald-900 font-bold'
                        : 'hover:text-emerald-700 hover:bg-white/60 text-stone-700'
                    }`}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>

            <div className="hidden xl:flex items-center gap-3 shrink-0 text-[11px] text-emerald-800 font-bold">
              <span className="flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                <Sparkles size={12} className="text-amber-500" />
                <span>100% Verified Local Shops</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MOBILE MENU SLIDE-DOWN */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200/70 py-3 px-4 bg-white/95 backdrop-blur-2xl space-y-2 animate-in slide-in-from-top-2">
          {/* Location picker */}
          <button
            onClick={() => {
              setIsPickerOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl glass-panel text-xs font-semibold text-stone-800"
          >
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-emerald-600" />
              <span>Deliver to: <strong>{currentLocality.name} ({currentLocality.pincode})</strong></span>
            </div>
            <span className="text-emerald-700 font-bold text-[11px]">Change</span>
          </button>

          {/* Return to Homepage Button in Mobile Menu */}
          {routerLocation.pathname !== '/' && (
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-700 text-white text-xs font-bold shadow-md transition"
              id="mobile-nav-return-homepage"
            >
              <ArrowLeft size={16} />
              <HomeIcon size={16} />
              <span>Return to Homepage</span>
            </Link>
          )}

          {/* Links */}
          <div className="space-y-1 pt-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    active
                      ? 'bg-emerald-600 text-white'
                      : 'text-stone-700 hover:bg-emerald-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Categories list in mobile drawer */}
          <div className="pt-2 border-t border-stone-200/60">
            <div className="text-[11px] font-bold uppercase text-stone-400 px-3 mb-1">
              Quick Categories
            </div>
            <div className="grid grid-cols-2 gap-1">
              {quickCategories.slice(1).map((cat) => (
                <Link
                  key={cat.path}
                  to={cat.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-stone-600 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
