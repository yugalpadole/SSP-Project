import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { ArrowLeft, Home } from 'lucide-react';

// Common components
import { GlassNavbar } from './components/common/GlassNavbar';
import { ShopkeeperSidebar } from './components/common/ShopkeeperSidebar';
import { Footer } from './components/common/Footer';
import { LocationModal } from './components/common/LocationModal';
import { CartConflictModal } from './components/customer/CartConflictModal';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ShopDiscoveryPage } from './pages/customer/ShopDiscoveryPage';
import { ShopDetailPage } from './pages/customer/ShopDetailPage';
import { ProductSearchPage } from './pages/customer/ProductSearchPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CategoriesPage } from './pages/customer/CategoriesPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrdersPage } from './pages/customer/OrdersPage';
import { ProfilePage } from './pages/customer/ProfilePage';

// Shopkeeper Pages
import { DashboardPage } from './pages/shopkeeper/DashboardPage';
import { ShopProfilePage } from './pages/shopkeeper/ShopProfilePage';
import { ProductsPage as ShopkeeperProductsPage } from './pages/shopkeeper/ProductsPage';
import { InventoryPage } from './pages/shopkeeper/InventoryPage';
import { OrdersPage as ShopkeeperOrdersPage } from './pages/shopkeeper/OrdersPage';
import { DeliverySettingsPage } from './pages/shopkeeper/DeliverySettingsPage';
import { ReservationSettingsPage } from './pages/shopkeeper/ReservationSettingsPage';
import { SalesPage } from './pages/shopkeeper/SalesPage';
import { ShopSettingsPage } from './pages/shopkeeper/ShopSettingsPage';

// Customer Layout Shell
const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, shop } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {user?.role === 'shopkeeper' && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-sm z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>You are logged in as Merchant: <strong>{shop?.name || user.name}</strong></span>
          </div>
          <Link
            to="/shopkeeper/dashboard"
            className="px-3 py-1 rounded-lg bg-white text-amber-900 font-bold hover:bg-amber-50 transition shadow-xs text-xs"
          >
            Go to Shopkeeper Dashboard →
          </Link>
        </div>
      )}
      <GlassNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        {!isHome && (
          <div className="mb-4 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-900 bg-white/95 hover:bg-emerald-50 border border-emerald-200/90 shadow-xs transition hover:scale-102 group cursor-pointer"
              id="return-to-homepage-button"
              title="Return to E-Bazaar Homepage"
            >
              <ArrowLeft size={14} className="text-emerald-600 transition-transform group-hover:-translate-x-1" />
              <Home size={14} className="text-emerald-600" />
              <span>Return to Homepage</span>
            </Link>
            <div className="text-[11px] text-stone-400 font-medium hidden sm:block">
              E-Bazaar Local Marketplace
            </div>
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Shopkeeper Layout Shell with Protected Role Guard and Resizable Sidebar
const ShopkeeperLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('ebazaar_sidebar_width');
    const parsed = saved ? parseInt(saved, 10) : 288;
    return isNaN(parsed) ? 288 : Math.min(Math.max(parsed, 210), 440);
  });

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-stone-600">Loading Shopkeeper Console...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'shopkeeper') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#faf9f6]">
      <ShopkeeperSidebar width={sidebarWidth} onWidthChange={setSidebarWidth} />
      <div
        className="flex-1 min-w-0 flex justify-center transition-[padding] duration-75"
        style={{ paddingLeft: isDesktop ? `${sidebarWidth}px` : undefined }}
      >
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:px-10 max-w-7xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <LocationProvider>
          <BrowserRouter>
            {/* Global Modals */}
            <LocationModal />
            <CartConflictModal />

            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Customer Experience Routes */}
              <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
              <Route path="/shops" element={<CustomerLayout><ShopDiscoveryPage /></CustomerLayout>} />
              <Route path="/shops/:id" element={<CustomerLayout><ShopDetailPage /></CustomerLayout>} />
              <Route path="/products" element={<CustomerLayout><ProductSearchPage /></CustomerLayout>} />
              <Route path="/products/:id" element={<CustomerLayout><ProductDetailPage /></CustomerLayout>} />
              <Route path="/categories" element={<CustomerLayout><CategoriesPage /></CustomerLayout>} />
              <Route path="/categories/:slug" element={<CustomerLayout><CategoriesPage /></CustomerLayout>} />
              <Route path="/cart" element={<CustomerLayout><CartPage /></CustomerLayout>} />
              <Route path="/checkout" element={<CustomerLayout><CheckoutPage /></CustomerLayout>} />
              <Route path="/orders" element={<CustomerLayout><OrdersPage /></CustomerLayout>} />
              <Route path="/profile" element={<CustomerLayout><ProfilePage /></CustomerLayout>} />

              {/* Shopkeeper Experience Routes */}
              <Route path="/shopkeeper/dashboard" element={<ShopkeeperLayout><DashboardPage /></ShopkeeperLayout>} />
              <Route path="/shopkeeper/profile" element={<ShopkeeperLayout><ShopProfilePage /></ShopkeeperLayout>} />
              <Route path="/shopkeeper/products" element={<ShopkeeperLayout><ShopkeeperProductsPage /></ShopkeeperLayout>} />
              <Route path="/shopkeeper/inventory" element={<ShopkeeperLayout><InventoryPage /></ShopkeeperLayout>} />
              <Route path="/shopkeeper/orders" element={<ShopkeeperLayout><ShopkeeperOrdersPage /></ShopkeeperLayout>} />
              <Route path="/shopkeeper/delivery-settings" element={<ShopkeeperLayout><DeliverySettingsPage /></ShopkeeperLayout>} />
              <Route path="/shopkeeper/reservation-settings" element={<ShopkeeperLayout><ReservationSettingsPage /></ShopkeeperLayout>} />
              <Route path="/shopkeeper/sales" element={<ShopkeeperLayout><SalesPage /></ShopkeeperLayout>} />
              <Route path="/shopkeeper/settings" element={<ShopkeeperLayout><ShopSettingsPage /></ShopkeeperLayout>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </LocationProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
