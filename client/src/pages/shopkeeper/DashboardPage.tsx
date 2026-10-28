import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Boxes,
  Clock,
  Truck,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Store,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Plus,
  Phone,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  Share2,
  X,
  ExternalLink,
  Flame,
  Star,
  ShieldCheck,
  MapPin,
  Clock3,
} from 'lucide-react';
import { StatCard } from '../../components/shopkeeper/StatCard';
import { useAuth } from '../../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { shop } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Restock state
  const [restockingId, setRestockingId] = useState<number | null>(null);

  // Quick Add Product Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: 1,
    description: '',
    price: 40,
    mrp: 50,
    unit: '1 kg',
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&q=80',
    stockQuantity: 25,
  });
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const fetchDashboard = async (silent = false) => {
    if (!shop?.id) return;
    try {
      if (!silent) setIsRefreshing(true);
      const res = await fetch(`/api/shopkeeper/dashboard?shopId=${shop.id}`, {
        headers: { 'x-shop-id': String(shop.id) },
      });
      const data = await res.json();
      setMetrics(data);
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (shop?.id) {
      fetchDashboard();
      // Auto-poll every 12 seconds for real-time order arrival
      const interval = setInterval(() => {
        fetchDashboard(true);
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [shop?.id]);

  // Load categories for Quick Add Product
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Quick Restock Product handler
  const handleQuickRestock = async (product: any, amount: number = 10) => {
    if (!shop?.id) return;
    setRestockingId(product.id);
    try {
      const newStock = (product.stock_quantity || 0) + amount;
      const res = await fetch(`/api/shopkeeper/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-shop-id': String(shop.id),
        },
        body: JSON.stringify({
          stockQuantity: newStock,
        }),
      });

      if (res.ok) {
        showToast(`Restocked +${amount} units for ${product.name}!`);
        await fetchDashboard(true);
      } else {
        showToast('Failed to update stock.');
      }
    } catch (e) {
      console.error(e);
      showToast('Error updating stock.');
    } finally {
      setRestockingId(null);
    }
  };

  // Quick Order Status Advance
  const handleUpdateOrderStatus = async (orderId: number, nextStatus: string) => {
    if (!shop?.id) return;
    try {
      const res = await fetch(`/api/shopkeeper/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-shop-id': String(shop.id),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showToast(`Order updated to: ${nextStatus.replace(/_/g, ' ')}`);
        await fetchDashboard(true);
      } else {
        showToast('Could not update order status.');
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to update order.');
    }
  };

  // Quick Add Product submission
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop?.id) return;
    setIsSavingProduct(true);
    try {
      const res = await fetch('/api/shopkeeper/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-shop-id': String(shop.id),
        },
        body: JSON.stringify({
          name: productForm.name,
          categoryId: Number(productForm.categoryId),
          description: productForm.description || `${productForm.name} fresh and locally sourced.`,
          price: Number(productForm.price),
          mrp: Number(productForm.mrp),
          unit: productForm.unit,
          imageUrl: productForm.imageUrl,
          stockQuantity: Number(productForm.stockQuantity),
        }),
      });

      if (res.ok) {
        showToast(`Product "${productForm.name}" published!`);
        setIsAddModalOpen(false);
        setProductForm({
          name: '',
          categoryId: 1,
          description: '',
          price: 40,
          mrp: 50,
          unit: '1 kg',
          imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&q=80',
          stockQuantity: 25,
        });
        await fetchDashboard(true);
      } else {
        showToast('Failed to add product.');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to add product.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const pendingOrdersCount =
    (metrics?.orders?.new_reservations || 0) + (metrics?.orders?.pending_deliveries || 0);

  const activePipelineCount =
    pendingOrdersCount +
    (metrics?.orders?.preparing_orders || 0) +
    (metrics?.orders?.ready_for_pickup_orders || 0) +
    (metrics?.orders?.active_delivery_orders || 0);

  const shareStoreUrl = `${window.location.origin}/shops/${shop?.id || 1}`;

  const handleCopyStoreLink = () => {
    navigator.clipboard.writeText(shareStoreUrl);
    showToast('Store link copied to clipboard!');
  };

  return (
    <div className="space-y-7 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-stone-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Urgent Orders Alert Banner */}
      {pendingOrdersCount > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-xl shadow-amber-600/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-xs shrink-0">
              <Clock size={22} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>{pendingOrdersCount} New Customer Order{pendingOrdersCount > 1 ? 's' : ''} Awaiting Acceptance</span>
                <span className="px-2 py-0.5 rounded-full bg-white text-amber-800 text-[10px] font-black uppercase">
                  Action Required
                </span>
              </div>
              <div className="text-xs text-amber-100 mt-0.5">
                Customers are expecting swift confirmation. Review items and begin packing.
              </div>
            </div>
          </div>
          <Link
            to="/shopkeeper/orders?status=pending"
            className="px-4 py-2.5 rounded-xl bg-white text-amber-900 font-bold text-xs hover:bg-amber-50 shadow-md transition flex items-center gap-1.5 shrink-0"
            id="urgent-orders-review-btn"
          >
            <span>Review Incoming Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Hero Store Cockpit Header */}
      <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/90 shadow-2xl relative overflow-hidden bg-gradient-to-br from-white/95 via-white/80 to-emerald-50/40">
        {/* Subtle decorative glowing background blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Shop Avatar & Info */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <img
                src={
                  shop?.logo_url ||
                  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'
                }
                alt={shop?.name || 'Shop'}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl object-cover border-2 border-emerald-400 shadow-md ring-4 ring-emerald-500/10"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 border-2 border-white rounded-full text-white shadow-xs" title="Store Live">
                <CheckCircle size={12} />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-heading tracking-tight">
                  {shop?.name || 'My Local Store'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Live Storefront
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Star size={11} className="fill-amber-400 text-amber-500" />
                  {shop?.rating || 4.9} ({shop?.review_count || 142} reviews)
                </span>
              </div>

              {/* Location & Metadata Badges */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-stone-500 mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-emerald-600" />
                  {shop?.locality || 'Yevalewadi'}, Pune
                </span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-1">
                  <Clock3 size={13} className="text-stone-400" />
                  {shop?.opening_hours || '8:00 AM - 9:30 PM'}
                </span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <Truck size={13} />
                  Delivery {shop?.is_delivery_enabled ? 'Active (₹' + (shop?.delivery_charge ?? 25) + ')' : 'Self-Pickup Only'}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Quick Add Product Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-md shadow-emerald-700/25 transition hover:scale-102 flex items-center gap-1.5 cursor-pointer"
              id="dashboard-add-product-btn"
            >
              <Plus size={15} />
              <span>Add Product</span>
            </button>

            {/* Public Storefront */}
            <Link
              to={`/shops/${shop?.id || 1}`}
              target="_blank"
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-800 bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 transition shadow-xs flex items-center gap-1.5"
              id="dashboard-view-storefront-btn"
            >
              <Store size={14} className="text-emerald-700" />
              <span>Customer View</span>
              <ExternalLink size={12} className="text-stone-400" />
            </Link>

            {/* Share Link */}
            <button
              onClick={handleCopyStoreLink}
              className="p-2.5 rounded-xl text-xs font-bold text-stone-600 bg-white hover:bg-stone-50 border border-stone-200 transition shadow-xs cursor-pointer"
              title="Copy Storefront URL"
            >
              <Share2 size={15} />
            </button>

            {/* Refresh */}
            <button
              onClick={() => fetchDashboard()}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl text-xs font-bold text-stone-600 bg-white hover:bg-stone-50 border border-stone-200 transition shadow-xs cursor-pointer disabled:opacity-60"
              title={`Refresh (Updated at ${lastUpdated})`}
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-emerald-600' : ''} />
            </button>
          </div>
        </div>

        {/* Quick Merchant Controls Sub-bar */}
        <div className="mt-6 pt-5 border-t border-stone-200/70 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link
            to="/shopkeeper/inventory"
            className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-stone-200/80 hover:border-emerald-300 transition shadow-2xs flex items-center gap-2 group"
          >
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition">
              <Boxes size={15} />
            </div>
            <div className="overflow-hidden">
              <div className="text-[11px] font-bold text-stone-900 truncate">Live Inventory</div>
              <div className="text-[10px] text-stone-400 truncate">Stock & Thresholds</div>
            </div>
          </Link>

          <Link
            to="/shopkeeper/orders"
            className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-stone-200/80 hover:border-purple-300 transition shadow-2xs flex items-center gap-2 group"
          >
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-100 transition">
              <ShoppingBag size={15} />
            </div>
            <div className="overflow-hidden">
              <div className="text-[11px] font-bold text-stone-900 truncate">All Orders</div>
              <div className="text-[10px] text-stone-400 truncate">Pickup & Delivery</div>
            </div>
          </Link>

          <Link
            to="/shopkeeper/delivery-settings"
            className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-stone-200/80 hover:border-sky-300 transition shadow-2xs flex items-center gap-2 group"
          >
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700 group-hover:bg-sky-100 transition">
              <Truck size={15} />
            </div>
            <div className="overflow-hidden">
              <div className="text-[11px] font-bold text-stone-900 truncate">Delivery Radius</div>
              <div className="text-[10px] text-stone-400 truncate">Charges & Coverage</div>
            </div>
          </Link>

          <Link
            to="/shopkeeper/reservation-settings"
            className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-stone-200/80 hover:border-amber-300 transition shadow-2xs flex items-center gap-2 group"
          >
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-100 transition">
              <Clock size={15} />
            </div>
            <div className="overflow-hidden">
              <div className="text-[11px] font-bold text-stone-900 truncate">Hold Duration</div>
              <div className="text-[10px] text-stone-400 truncate">Auto-expiry settings</div>
            </div>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Completed Sales"
          value={`₹${metrics?.orders?.total_revenue || 0}`}
          subtitle={`${metrics?.orders?.completed_orders || 0} orders fulfilled`}
          icon={TrendingUp}
          color="emerald"
          badge="100% Fulfilled"
          trend={{ value: '+14%', isPositive: true, label: 'vs last week' }}
        />

        <StatCard
          title="Active Order Pipeline"
          value={activePipelineCount}
          subtitle={
            pendingOrdersCount > 0
              ? `${pendingOrdersCount} orders need acceptance`
              : 'All active orders in packing/transit'
          }
          icon={ShoppingBag}
          color={pendingOrdersCount > 0 ? 'amber' : 'purple'}
          badge={pendingOrdersCount > 0 ? `${pendingOrdersCount} Action Needed` : 'On Track'}
          onClick={() => navigate('/shopkeeper/orders')}
        />

        <StatCard
          title="Available Inventory"
          value={metrics?.availableStock || 0}
          subtitle={`${metrics?.totalReserved || 0} units reserved in carts`}
          icon={Boxes}
          color="blue"
          badge={metrics?.lowStockCount > 0 ? `${metrics.lowStockCount} Low Items` : 'Healthy'}
          onClick={() => navigate('/shopkeeper/inventory')}
        />

        <StatCard
          title="Catalog Products"
          value={metrics?.totalProducts || 0}
          subtitle="Active items listed"
          icon={Package}
          color="purple"
          badge="Fresh Stock"
          onClick={() => navigate('/shopkeeper/products')}
        />
      </div>

      {/* Interactive Visual Order Pipeline Workflow */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-stone-900 font-heading">
                Live Order Pipeline
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Real-time customer order lifecycle requiring fulfillment
            </p>
          </div>
          <Link
            to="/shopkeeper/orders"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>Manage All Orders</span>
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* 5-Step Pipeline Flow */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Pending */}
          <Link
            to="/shopkeeper/orders?status=pending"
            className={`p-4 rounded-2xl border transition-all text-center relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md ${
              pendingOrdersCount > 0
                ? 'bg-amber-500/10 border-amber-300 ring-2 ring-amber-400/20'
                : 'glass-panel bg-white/70 border-stone-200/80 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">
                1. Pending
              </span>
              {pendingOrdersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <div className="text-3xl font-black text-stone-900 font-heading mt-1">
              {pendingOrdersCount}
            </div>
            <div className="text-[11px] text-stone-500 font-medium mt-1">Needs acceptance</div>
          </Link>

          {/* 2. Preparing */}
          <Link
            to="/shopkeeper/orders?status=preparing"
            className="glass-panel bg-white/70 hover:bg-white p-4 rounded-2xl border border-stone-200/80 hover:border-purple-300 transition-all text-center relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold uppercase text-purple-700 tracking-wider">
                2. Preparing
              </span>
            </div>
            <div className="text-3xl font-black text-stone-900 font-heading mt-1">
              {metrics?.orders?.preparing_orders || 0}
            </div>
            <div className="text-[11px] text-stone-500 font-medium mt-1">Packing in progress</div>
          </Link>

          {/* 3. Ready for Pickup */}
          <Link
            to="/shopkeeper/orders?status=ready_for_pickup"
            className="glass-panel bg-white/70 hover:bg-white p-4 rounded-2xl border border-stone-200/80 hover:border-emerald-300 transition-all text-center relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                3. Ready Pickup
              </span>
            </div>
            <div className="text-3xl font-black text-stone-900 font-heading mt-1">
              {metrics?.orders?.ready_for_pickup_orders || 0}
            </div>
            <div className="text-[11px] text-stone-500 font-medium mt-1">Waiting at counter</div>
          </Link>

          {/* 4. Out for Delivery */}
          <Link
            to="/shopkeeper/orders?status=out_for_delivery"
            className="glass-panel bg-white/70 hover:bg-white p-4 rounded-2xl border border-stone-200/80 hover:border-sky-300 transition-all text-center relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold uppercase text-sky-700 tracking-wider">
                4. Out Delivery
              </span>
            </div>
            <div className="text-3xl font-black text-stone-900 font-heading mt-1">
              {metrics?.orders?.active_delivery_orders || 0}
            </div>
            <div className="text-[11px] text-stone-500 font-medium mt-1">Rider on route</div>
          </Link>

          {/* 5. Completed */}
          <Link
            to="/shopkeeper/orders?status=completed"
            className="glass-panel bg-emerald-50/50 hover:bg-emerald-50 p-4 rounded-2xl border border-emerald-200 hover:border-emerald-300 transition-all text-center relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider">
                5. Completed
              </span>
              <CheckCircle size={13} className="text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-800 font-heading mt-1">
              {metrics?.orders?.completed_orders || 0}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">Fulfilled</div>
          </Link>
        </div>
      </div>

      {/* Operational 2-Column Split: Orders Activity & Fast Restock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column (7 cols): Recent Customer Orders */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-emerald-700" />
              <h3 className="font-extrabold text-sm sm:text-base text-stone-900 font-heading">
                Recent Customer Activity
              </h3>
            </div>
            <Link
              to="/shopkeeper/orders"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              View Order Desk →
            </Link>
          </div>

          {metrics?.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {metrics.recentOrders.map((ord: any) => {
                const isPending = ord.status === 'pending';
                const isPreparing = ord.status === 'preparing';

                return (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-white/80 border border-stone-200/90 shadow-2xs hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs sm:text-sm text-stone-900 font-heading">
                            {ord.order_number}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              ord.order_type === 'delivery'
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {ord.order_type === 'delivery' ? '⚡ Delivery' : '🛍️ Pickup'}
                          </span>
                        </div>

                        <div className="text-xs text-stone-600 font-medium mt-1">
                          <span className="font-bold text-stone-900">{ord.customer_name}</span>
                          <span className="text-stone-300 mx-1.5">•</span>
                          <span>{ord.customer_phone}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-sm text-stone-900 font-heading">
                          ₹{ord.total_amount}
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase mt-1 ${
                            ord.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {ord.delivery_address && (
                      <div className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded-xl border border-stone-100 truncate flex items-center gap-1.5">
                        <MapPin size={12} className="shrink-0 text-stone-400" />
                        <span className="truncate">{ord.delivery_address}</span>
                      </div>
                    )}

                    {/* Quick Order Action Buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-stone-100 gap-2">
                      <a
                        href={`https://wa.me/${ord.customer_phone?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        <MessageCircle size={13} />
                        <span>WhatsApp Customer</span>
                      </a>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(ord.id, 'preparing')}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                          >
                            Accept & Start Packing
                          </button>
                        )}
                        {isPreparing && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateOrderStatus(
                                ord.id,
                                ord.order_type === 'delivery' ? 'out_for_delivery' : 'ready_for_pickup'
                              )
                            }
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                          >
                            {ord.order_type === 'delivery' ? 'Dispatch for Delivery' : 'Mark Ready'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-stone-500 glass-pill rounded-2xl space-y-2">
              <ShoppingBag size={28} className="mx-auto text-stone-300" />
              <div className="font-bold text-stone-700">No Orders in Queue</div>
              <div>When nearby shoppers reserve products or checkout, orders will pop up instantly here.</div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Fast Moving Inventory & 1-Click Restock */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes size={18} className="text-emerald-700" />
              <h3 className="font-extrabold text-sm sm:text-base text-stone-900 font-heading">
                Inventory Quick Desk
              </h3>
            </div>
            <Link
              to="/shopkeeper/inventory"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Full Catalog →
            </Link>
          </div>

          <p className="text-xs text-stone-500">
            Monitor real-time shelf stock and restock popular items with 1 click.
          </p>

          <div className="space-y-2.5">
            {(metrics?.products || metrics?.lowStockItems || []).slice(0, 5).map((item: any) => {
              const stock = item.available_stock ?? item.stock_quantity ?? 0;
              const isLow = stock <= 10;
              const isRestockingThis = restockingId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-white/80 border border-stone-200/90 shadow-2xs hover:shadow-xs transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-11 h-11 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                    />
                    <div className="overflow-hidden">
                      <div className="font-bold text-xs text-stone-900 truncate">{item.name}</div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                        <span>₹{item.price} / {item.unit || 'unit'}</span>
                        <span
                          className={`font-black text-[10px] px-1.5 py-0.2 rounded ${
                            isLow ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {stock} in stock
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Restock Button */}
                  <button
                    type="button"
                    onClick={() => handleQuickRestock(item, 10)}
                    disabled={isRestockingThis}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-100 border border-stone-200 hover:border-emerald-300 text-stone-800 hover:text-emerald-900 font-bold text-[11px] transition shrink-0 cursor-pointer flex items-center gap-1 disabled:opacity-60"
                    title="Add +10 units to stock"
                  >
                    <Plus size={12} className="text-emerald-700" />
                    <span>{isRestockingThis ? '...' : '+10'}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-medium">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>Need to add fresh produce or catalog item?</span>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer shrink-0 ml-2"
            >
              + Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="glass-panel-elevated bg-white p-6 sm:p-7 rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 font-heading">
                    Add New Product
                  </h3>
                  <p className="text-xs text-stone-500">Publish immediately to your storefront</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Fresh Organic Tomatoes"
                  required
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: Number(e.target.value) })}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="1 kg / 500 g"
                    required
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    required
                    min={1}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                    required
                    min={1}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                    required
                    min={1}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  required
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-700/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSavingProduct ? 'Publishing...' : 'Publish to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
