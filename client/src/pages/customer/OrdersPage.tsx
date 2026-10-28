import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PackageCheck,
  Clock,
  Truck,
  Store,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  RefreshCw,
  MapPin,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ReviewModal } from '../../components/common/ReviewModal';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | 'reservations' | 'deliveries' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  const fetchOrders = async (silent = false) => {
    if (!user) {
      setIsLoading(false);
      setOrders([]);
      return;
    }
    try {
      if (!silent) setIsLoading(true);
      const res = await fetch(`/api/orders/customer?customerId=${user.id}`, {
        headers: { 'x-user-id': String(user.id) },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();

      // 1-second interval to update countdown timers smoothly
      const timerInterval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);

      // 8-second interval to check if shopkeeper updated status (live tracking)
      const pollInterval = setInterval(() => {
        fetchOrders(true);
      }, 8000);

      return () => {
        clearInterval(timerInterval);
        clearInterval(pollInterval);
      };
    } else {
      setIsLoading(false);
      setOrders([]);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto my-16 border border-white shadow-xl animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <PackageCheck size={32} />
        </div>
        <h2 className="text-xl font-bold text-stone-900 font-heading">Sign In to View Orders</h2>
        <p className="text-xs text-stone-500 mt-2 mb-6 max-w-sm mx-auto">
          Please log in to your account to track your orders, monitor live pickup countdowns, and submit shop reviews.
        </p>
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-700/20 inline-flex items-center gap-2"
        >
          <span>Sign In to Your Account</span>
        </Link>
      </div>
    );
  }

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to cancel this order? Any reserved stock will be immediately returned to the shop.')) {
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'customer', reason: 'Customer requested cancellation' }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Status Badge Component
  const getStatusBadge = (status: OrderStatus, orderType: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock size={12} />
            <span>Order Placed (Waiting Confirmation)</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
            <CheckCircle size={12} />
            <span>Confirmed by Shop</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1 animate-pulse">
            <Store size={12} />
            <span>Preparing Items</span>
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
            <CheckCircle size={12} />
            <span>Ready for Pickup at Store!</span>
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-600 text-white flex items-center gap-1 shadow-sm animate-pulse">
            <Truck size={12} />
            <span>Out for Delivery</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle size={12} className="text-emerald-600" />
            <span>{orderType === 'reserve_collect' ? 'Collected & Completed' : 'Delivered & Completed'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-200 text-stone-600 flex items-center gap-1">
            <XCircle size={12} />
            <span>Order Cancelled</span>
          </span>
        );
      case 'expired':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 flex items-center gap-1">
            <AlertTriangle size={12} />
            <span>Reservation Expired (Stock Released)</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Compute countdown string
  const formatCountdown = (expiresAtIso?: string) => {
    if (!expiresAtIso) return null;
    const diff = new Date(expiresAtIso).getTime() - currentTime;
    if (diff <= 0) return 'Expired';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Filter orders by tab
  const filteredOrders = orders.filter((o) => {
    if (selectedStatusTab === 'reservations') return o.order_type === 'reserve_collect';
    if (selectedStatusTab === 'deliveries') return o.order_type === 'delivery';
    if (selectedStatusTab === 'completed') return o.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
            <PackageCheck size={13} />
            <span>Customer Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            My Orders & Pickup Reservations
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track real-time preparation, reservation validity deadlines, and review verified purchases.
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          className="px-4 py-2 rounded-xl text-xs font-bold glass-pill text-stone-700 hover:bg-white flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={13} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All Orders (${orders.length})` },
          { id: 'reservations', label: `Reserve & Collect (${orders.filter(o => o.order_type === 'reserve_collect').length})` },
          { id: 'deliveries', label: `Home Deliveries (${orders.filter(o => o.order_type === 'delivery').length})` },
          { id: 'completed', label: `Completed (${orders.filter(o => o.status === 'completed').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatusTab(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              selectedStatusTab === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'glass-panel text-stone-700 hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="glass-panel h-48 rounded-3xl animate-pulse bg-white/40" />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isReservation = order.order_type === 'reserve_collect';
            const countdown = isReservation && ['pending', 'confirmed', 'preparing', 'ready_for_pickup'].includes(order.status)
              ? formatCountdown(order.reservation_expires_at)
              : null;
            const canCancel = ['pending', 'confirmed', 'preparing'].includes(order.status);
            const isCompleted = order.status === 'completed';
            const hasReviewed = Boolean(order.has_reviewed);

            return (
              <div
                key={order.id}
                className="glass-panel rounded-3xl border border-white shadow-xl overflow-hidden transition-all hover:shadow-2xl"
              >
                {/* Order Top Bar */}
                <div className="p-5 bg-white/60 border-b border-stone-200/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${isReservation ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {isReservation ? <Clock size={20} /> : <Truck size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-stone-900">{order.order_number}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          {isReservation ? 'Pickup Reservation' : 'Home Delivery'}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar size={12} />
                        <span>Placed on {new Date(order.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {getStatusBadge(order.status, order.order_type)}
                  </div>
                </div>

                {/* Expiry Countdown Alert Banner for Reservations */}
                {countdown && (
                  <div className="bg-amber-500/10 border-b border-amber-300/40 px-5 py-2.5 flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-2 font-semibold">
                      <Clock size={15} className="text-amber-600 animate-spin" />
                      <span>Reservation Validity Deadline:</span>
                    </div>
                    <div className="font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-xl">
                      Expires in: {countdown}
                    </div>
                  </div>
                )}

                {/* Order Content */}
                <div className="p-5 sm:p-6 space-y-4">
                  
                  {/* Shop Details */}
                  <div className="flex items-center justify-between text-xs text-stone-600 pb-3 border-b border-stone-200/40">
                    <div className="flex items-center gap-2">
                      <Store size={15} className="text-emerald-700" />
                      <span>Shop: <strong className="text-stone-900">{order.shop_name}</strong> ({order.shop_locality})</span>
                    </div>

                    {order.shop_whatsapp && (
                      <a
                        href={`https://wa.me/${order.shop_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hi ${order.shop_name}! Inquiring about my order ${order.order_number}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp Shop</span>
                      </a>
                    )}
                  </div>

                  {/* Items Purchased */}
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80'}
                            alt={item.product_name}
                            className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                          />
                          <div>
                            <span className="font-semibold text-stone-900">{item.product_name}</span>
                            <div className="text-[11px] text-stone-400">
                              {item.unit} • ₹{item.price} × {item.quantity}
                            </div>
                          </div>
                        </div>
                        <span className="font-bold text-stone-900">₹{item.total_price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total and Fulfillment metadata */}
                  <div className="pt-3 border-t border-stone-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      {order.delivery_address && (
                        <div className="flex items-center gap-1.5 text-stone-600">
                          <MapPin size={13} className="text-emerald-600 shrink-0" />
                          <span>Delivery to: {order.delivery_address}</span>
                        </div>
                      )}
                      {order.cancellation_reason && (
                        <div className="text-stone-500 italic mt-0.5">
                          Reason: {order.cancellation_reason}
                        </div>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 self-end sm:self-auto">
                      <span className="text-stone-500 font-medium">Total Paid:</span>
                      <span className="text-xl font-black text-emerald-800">₹{order.total_amount}</span>
                    </div>
                  </div>

                  {/* Action Buttons: Cancel / Review */}
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition border border-red-200"
                      >
                        Cancel Reservation
                      </button>
                    )}

                    {isCompleted && !hasReviewed && (
                      <button
                        onClick={() => setReviewOrder(order)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition shadow-sm flex items-center gap-1.5"
                      >
                        <Star size={14} className="fill-white" />
                        <span>Write Verified Review</span>
                      </button>
                    )}

                    {isCompleted && hasReviewed && (
                      <div className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60">
                        <CheckCircle size={14} />
                        <span>Review Submitted</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto">
          <PackageCheck size={40} className="mx-auto text-stone-400 mb-3" />
          <h3 className="font-bold text-base text-stone-800">No orders in this tab</h3>
          <p className="text-xs text-stone-500 mt-1 mb-4">You have not placed any orders matching this filter yet.</p>
          <Link to="/products" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600">
            Start Exploring Products
          </Link>
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <ReviewModal
          isOpen={true}
          orderId={reviewOrder.id}
          orderNumber={reviewOrder.order_number}
          shopId={reviewOrder.shop_id}
          shopName={reviewOrder.shop_name || 'Local Shop'}
          productId={reviewOrder.items?.[0]?.product_id}
          productName={reviewOrder.items?.[0]?.product_name}
          onClose={() => setReviewOrder(null)}
          onSuccess={() => {
            fetchOrders();
          }}
        />
      )}

    </div>
  );
};
