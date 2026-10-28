import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Package,
  Boxes,
  ClipboardList,
  Truck,
  Clock,
  TrendingUp,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  RefreshCw,
  Home,
  ArrowLeft,
  GripVertical,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ShopkeeperSidebarProps {
  width?: number;
  onWidthChange?: (width: number) => void;
}

export const ShopkeeperSidebar: React.FC<ShopkeeperSidebarProps> = ({
  width: externalWidth,
  onWidthChange: externalOnWidthChange,
}) => {
  const { user, shop, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Local width fallback if not passed from parent
  const [internalWidth, setInternalWidth] = useState<number>(() => {
    const saved = localStorage.getItem('ebazaar_sidebar_width');
    const parsed = saved ? parseInt(saved, 10) : 288;
    return isNaN(parsed) ? 288 : Math.min(Math.max(parsed, 210), 440);
  });

  const width = externalWidth ?? internalWidth;

  const setWidth = (newW: number) => {
    const clamped = Math.min(Math.max(newW, 210), 440);
    if (externalOnWidthChange) {
      externalOnWidthChange(clamped);
    } else {
      setInternalWidth(clamped);
    }
    localStorage.setItem('ebazaar_sidebar_width', String(clamped));
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleResetWidth = () => {
    setWidth(288);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setWidth(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const navItems = [
    { name: 'Dashboard', path: '/shopkeeper/dashboard', icon: LayoutDashboard },
    { name: 'My Shop Profile', path: '/shopkeeper/profile', icon: Store },
    { name: 'Products', path: '/shopkeeper/products', icon: Package },
    { name: 'Live Inventory', path: '/shopkeeper/inventory', icon: Boxes },
    { name: 'Orders & Pickup', path: '/shopkeeper/orders', icon: ClipboardList },
    { name: 'Delivery Settings', path: '/shopkeeper/delivery-settings', icon: Truck },
    { name: 'Reservation Rules', path: '/shopkeeper/reservation-settings', icon: Clock },
    { name: 'Sales & Trends', path: '/shopkeeper/sales', icon: TrendingUp },
    { name: 'Shop Settings', path: '/shopkeeper/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Compact mode styling threshold
  const isCompact = width < 240;

  return (
    <>
      {/* Mobile Header Bar for Shopkeeper */}
      <div className="lg:hidden sticky top-0 z-40 glass-navbar px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/name.png" alt="E-Bazaar" className="h-7 w-auto" />
          <span className="text-[10px] text-emerald-800 font-bold px-2 py-0.5 rounded-full bg-emerald-100">
            Shop Portal
          </span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl glass-pill text-stone-700 cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Glass Sidebar (Adjustable Width on Desktop) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 glass-sidebar flex flex-col justify-between transition-transform duration-300 lg:transition-none ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ width: `${width}px` }}
      >
        {/* Drag Handle (Desktop only) */}
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={handleResetWidth}
          className={`hidden lg:flex absolute top-0 -right-1.5 bottom-0 w-3 cursor-col-resize hover:bg-emerald-500/20 active:bg-emerald-500/40 transition-colors items-center justify-center group z-30 select-none ${
            isDragging ? 'bg-emerald-500/30' : ''
          }`}
          title="Drag to resize sidebar • Double click to reset width (288px)"
        >
          {/* Subtle vertical indicator line */}
          <div
            className={`w-[2px] h-full transition-colors ${
              isDragging ? 'bg-emerald-600' : 'bg-transparent group-hover:bg-emerald-400'
            }`}
          />

          {/* Centered Grabber Grip Pill */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-9 rounded-full bg-white border border-stone-200/90 shadow-md flex items-center justify-center transition-transform ${
              isDragging
                ? 'scale-110 bg-emerald-50 border-emerald-400 shadow-emerald-500/20'
                : 'group-hover:scale-110 group-hover:border-emerald-300'
            }`}
          >
            <GripVertical
              size={12}
              className={`transition-colors ${
                isDragging ? 'text-emerald-700' : 'text-stone-400 group-hover:text-emerald-600'
              }`}
            />
          </div>
        </div>

        <div className="overflow-hidden">
          {/* Top Logo & Shop Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200/60">
            <Link to="/shopkeeper/dashboard" className="block mb-3.5">
              <img src="/name.png" alt="eBazaar" className="h-8 w-auto object-contain" />
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                  Shopkeeper Hub
                </span>
                {!isCompact && (
                  <span className="text-[10px] text-stone-400 truncate">• Console</span>
                )}
              </div>
            </Link>

            {/* Shop badge card */}
            <div className="p-2.5 sm:p-3 rounded-2xl glass-panel bg-white/60 border border-white">
              <div className="flex items-center gap-2.5">
                <img
                  src={
                    shop?.logo_url ||
                    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'
                  }
                  alt={shop?.name || 'Shop'}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-emerald-200 shadow-sm shrink-0"
                />
                <div className="overflow-hidden min-w-0">
                  <h4 className="text-xs font-bold text-stone-900 truncate">
                    {shop?.name || 'My Local Store'}
                  </h4>
                  <div className="text-[11px] text-stone-500 truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping shrink-0" />
                    <span className="truncate">{shop?.locality || 'Active Store'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-2.5 sm:p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-310px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                      : 'text-stone-700 hover:text-emerald-800 hover:bg-emerald-50/60'
                  }`}
                  title={item.name}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Icon size={17} className={`shrink-0 ${active ? 'text-white' : 'text-stone-500'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {active && !isCompact && <ChevronRight size={14} className="text-white shrink-0" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions & Width Preset Controls */}
        <div className="p-3 sm:p-4 border-t border-stone-200/60 space-y-2 bg-stone-50/50 overflow-hidden">
          {/* Quick Width Presets (Desktop only) */}
          <div className="hidden lg:flex items-center justify-between text-[10px] text-stone-400 pb-1">
            <span className="font-semibold text-stone-500 truncate">
              {Math.round(width)}px
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setWidth(220)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                  width <= 235 ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-stone-200/70 text-stone-600'
                }`}
                title="Compact Width (220px)"
              >
                Compact
              </button>
              <button
                type="button"
                onClick={() => setWidth(288)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                  width > 235 && width < 340 ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-stone-200/70 text-stone-600'
                }`}
                title="Default Width (288px)"
              >
                Default
              </button>
              <button
                type="button"
                onClick={() => setWidth(380)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                  width >= 340 ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-stone-200/70 text-stone-600'
                }`}
                title="Wide Width (380px)"
              >
                Wide
              </button>
            </div>
          </div>

          <Link
            to="/"
            onClick={() => setIsMobileOpen(false)}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-stone-800 bg-white hover:bg-emerald-50 transition flex items-center justify-center gap-2 border border-stone-200 shadow-xs group cursor-pointer truncate"
            id="sidebar-return-homepage"
          >
            <ArrowLeft size={13} className="text-emerald-600 transition-transform group-hover:-translate-x-0.5 shrink-0" />
            <Home size={14} className="text-emerald-600 shrink-0" />
            <span className="truncate">Return to Home</span>
          </Link>

          <Link
            to={`/shops/${shop?.id || 1}`}
            onClick={() => setIsMobileOpen(false)}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-emerald-800 glass-pill hover:bg-emerald-50 transition flex items-center justify-center gap-2 border border-emerald-200 cursor-pointer truncate"
          >
            <Store size={13} className="text-emerald-600 shrink-0" />
            <span className="truncate">Live Storefront</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition flex items-center justify-center gap-2 cursor-pointer truncate"
          >
            <LogOut size={14} className="shrink-0" />
            <span className="truncate">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
