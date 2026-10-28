import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  CheckCircle,
  Truck,
  Clock,
  Sparkles,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/shopkeeper/StatCard';

export const SalesPage: React.FC = () => {
  const { shop } = useAuth();
  const shopId = shop?.id;

  const [salesData, setSalesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSales = async () => {
    if (!shopId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/shopkeeper/sales?shopId=${shopId}`, {
        headers: { 'x-shop-id': String(shopId) },
      });
      const data = await res.json();
      setSalesData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchSales();
    }
  }, [shopId]);

  const summary = salesData?.summary || {};
  const popularProducts = salesData?.popularProducts || [];
  const completedOrders = salesData?.completedOrders || [];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider mb-2">
            <TrendingUp size={13} />
            <span>Store Performance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            Sales & Order Trends
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Realized revenue from completed customer pickups and delivered neighborhood orders.
          </p>
        </div>

        <button
          onClick={fetchSales}
          className="px-4 py-2 rounded-xl text-xs font-bold glass-pill text-stone-700 hover:bg-white flex items-center gap-1.5"
        >
          <RefreshCw size={13} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Realized Revenue"
          value={`₹${summary.total_sales || 0}`}
          subtitle="From all fulfilled orders"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Completed Orders"
          value={summary.total_completed_orders || 0}
          subtitle={`${summary.delivery_orders_count || 0} delivery • ${summary.pickup_orders_count || 0} pickup`}
          icon={CheckCircle}
          color="purple"
        />
        <StatCard
          title="Average Order Value"
          value={`₹${Math.round(summary.avg_order_value || 0)}`}
          subtitle="Basket size per customer"
          icon={BarChart3}
          color="blue"
        />
        <StatCard
          title="Fulfillment Split"
          value={`${summary.pickup_orders_count || 0} Pickups`}
          subtitle={`${summary.delivery_orders_count || 0} Deliveries`}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Grid: Popular Products & Completed Orders Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Top Selling Products */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <span>Top Performing Items</span>
          </h3>

          {popularProducts.length > 0 ? (
            <div className="space-y-3">
              {popularProducts.map((p: any, idx: number) => (
                <div
                  key={p.product_id}
                  className="p-3.5 rounded-2xl glass-pill bg-white/70 border border-stone-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center font-black text-xs text-stone-400">
                      #{idx + 1}
                    </span>
                    <img
                      src={p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80'}
                      alt={p.product_name}
                      className="w-10 h-10 rounded-xl object-cover bg-stone-100"
                    />
                    <div>
                      <div className="font-bold text-xs text-stone-900 line-clamp-1">
                        {p.product_name}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {p.total_quantity_sold} {p.unit} sold
                      </div>
                    </div>
                  </div>

                  <span className="font-extrabold text-xs text-emerald-800">
                    ₹{p.total_revenue}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-stone-500 glass-pill rounded-2xl">
              No sales recorded yet. Once orders are fulfilled, popular products will be ranked here.
            </div>
          )}
        </div>

        {/* Right: Completed Orders History */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
            Completed Orders Ledger ({completedOrders.length})
          </h3>

          {completedOrders.length > 0 ? (
            <div className="divide-y divide-stone-200/50">
              {completedOrders.map((ord: any) => (
                <div key={ord.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-900">{ord.order_number}</span>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {ord.order_type === 'reserve_collect' ? 'Store Pickup' : 'Delivered'}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Customer: {ord.customer_name} • {ord.item_count} items • {new Date(ord.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-sm text-emerald-800">
                      ₹{ord.total_amount}
                    </span>
                    <div className="text-[10px] text-stone-400">Settled</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-stone-500 glass-pill rounded-2xl">
              No completed orders yet.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
