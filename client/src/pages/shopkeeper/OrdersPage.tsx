import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Phone,
  MessageSquare,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Package,
  ArrowRight
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const OrdersPage: React.FC = () => {
  const { shop } = useAuth();
  const shopId = shop?.id;

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'preparing' | 'ready' | 'delivery' | 'completed' | 'all'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async (silent = false) => {
    if (!shopId) return;
    try {
      if (!silent) setIsLoading(true);
      const res = await fetch(`/api/shopkeeper/orders?shopId=${shopId}`, {
        headers: { 'x-shop-id': String(shopId) },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchOrders();
      const interval = setInterval(() => {
        fetchOrders(true);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [shopId]);

  const handlePrintReceipt = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Order Receipt - ${order.order_number}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 400px; margin: 0 auto; }
            h2 { text-align: center; margin-bottom: 5px; }
            .meta { font-size: 12px; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .item { display: flex; justify-content: space-between; font-size: 13px; margin: 6px 0; }
            .total { font-weight: bold; border-top: 1px dashed #000; padding-top: 10px; margin-top: 15px; font-size: 15px; display: flex; justify-content: space-between; }
            .footer { text-align: center; font-size: 11px; margin-top: 25px; }
          </style>
        </head>
        <body>
          <h2>${shop?.name || 'eBazaar Store'}</h2>
          <div class="meta">
            <div>Order: <strong>${order.order_number}</strong></div>
            <div>Type: ${order.order_type === 'reserve_collect' ? 'Reserve & Collect' : 'Home Delivery'}</div>
            <div>Customer: ${order.customer_name} (${order.customer_phone})</div>
            ${order.delivery_address ? `<div>Address: ${order.delivery_address}</div>` : ''}
            <div>Date: ${new Date(order.created_at).toLocaleString()}</div>
          </div>
          <div>
            ${order.items?.map((it: any) => `
              <div class="item">
                <span>${it.product_name} (${it.unit}) x${it.quantity}</span>
                <span>₹${it.total_price}</span>
              </div>
            `).join('')}
          </div>
          <div class="total">
            <span>TOTAL AMOUNT:</span>
            <span>₹${order.total_amount}</span>
          </div>
          <div class="footer">Thank you for ordering with eBazaar Quick Commerce!</div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/shopkeeper/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-shop-id': String(shopId) },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders by active tab
  const filteredOrders = orders.filter((o) => {
    if (selectedTab === 'pending') return o.status === 'pending';
    if (selectedTab === 'preparing') return o.status === 'preparing' || o.status === 'confirmed';
    if (selectedTab === 'ready') return o.status === 'ready_for_pickup';
    if (selectedTab === 'delivery') return o.status === 'out_for_delivery';
    if (selectedTab === 'completed') return o.status === 'completed' || o.status === 'cancelled' || o.status === 'expired';
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider mb-2">
            <ClipboardList size={13} />
            <span>Fulfillment Workflow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            Orders & Reservations Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Accept incoming pickup reservations and delivery requests, prepare packages, and mark completion.
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          className="px-4 py-2 rounded-xl text-xs font-bold glass-pill text-stone-700 hover:bg-white flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={13} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'pending', label: `Pending Approvals (${orders.filter(o => o.status === 'pending').length})` },
          { id: 'preparing', label: `Preparing (${orders.filter(o => ['preparing', 'confirmed'].includes(o.status)).length})` },
          { id: 'ready', label: `Ready for Pickup (${orders.filter(o => o.status === 'ready_for_pickup').length})` },
          { id: 'delivery', label: `Out for Delivery (${orders.filter(o => o.status === 'out_for_delivery').length})` },
          { id: 'completed', label: `Completed & History (${orders.filter(o => ['completed', 'cancelled', 'expired'].includes(o.status)).length})` },
          { id: 'all', label: `All Orders (${orders.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              selectedTab === tab.id
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

            return (
              <div
                key={order.id}
                className="glass-panel rounded-3xl border border-white shadow-xl overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 bg-white/60 border-b border-stone-200/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${isReservation ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {isReservation ? <Clock size={20} /> : <Truck size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-stone-900">{order.order_number}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          {isReservation ? 'Reserve & Collect' : 'Home Delivery'}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Customer: <strong>{order.customer_name}</strong> • Phone: {order.customer_phone}
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-stone-100 text-stone-800 border border-stone-200">
                    Status: {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Body Details */}
                <div className="p-5 sm:p-6 space-y-4">
                  
                  {/* Items list */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                      Ordered Items:
                    </span>
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80'}
                            alt={item.product_name}
                            className="w-9 h-9 rounded-lg object-cover bg-stone-100"
                          />
                          <div>
                            <span className="font-semibold text-stone-900">{item.product_name}</span>
                            <span className="text-stone-400 ml-2">({item.unit})</span>
                          </div>
                        </div>
                        <span className="font-bold text-stone-900">
                          {item.quantity} × ₹{item.price} = ₹{item.total_price}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Metadata */}
                  <div className="pt-3 border-t border-stone-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      {order.delivery_address && (
                        <div className="flex items-center gap-1.5 text-stone-600">
                          <MapPin size={13} className="text-emerald-600 shrink-0" />
                          <span>Delivery to: {order.delivery_address}</span>
                        </div>
                      )}
                      {order.customer_notes && (
                        <div className="text-stone-600 italic mt-0.5">
                          Notes: "{order.customer_notes}"
                        </div>
                      )}
                      {order.reservation_expires_at && (
                        <div className="text-amber-800 text-[11px] font-semibold mt-0.5">
                          Reservation Deadline: {new Date(order.reservation_expires_at).toLocaleTimeString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 self-end sm:self-auto">
                      <span className="text-stone-500 font-medium">Order Total:</span>
                      <span className="text-xl font-black text-emerald-800">₹{order.total_amount}</span>
                    </div>
                  </div>

                  {/* Action Pipeline Buttons */}
                  <div className="pt-3 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-3">
                    
                    {/* Print Packing Slip */}
                    <button
                      type="button"
                      onClick={() => handlePrintReceipt(order)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ClipboardList size={13} className="text-stone-500" />
                      <span>Print Slip</span>
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status: Pending */}
                      {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                          disabled={updatingId === order.id}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200"
                        >
                          Reject Request
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                          disabled={updatingId === order.id}
                          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
                        >
                          <CheckCircle size={14} />
                          <span>Accept & Start Preparing</span>
                        </button>
                      </>
                    )}

                    {/* Status: Preparing */}
                    {['preparing', 'confirmed'].includes(order.status) && (
                      <>
                        {isReservation ? (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'ready_for_pickup')}
                            disabled={updatingId === order.id}
                            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm flex items-center gap-1.5"
                          >
                            <Clock size={14} />
                            <span>Mark Ready for Pickup</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}
                            disabled={updatingId === order.id}
                            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-sm flex items-center gap-1.5"
                          >
                            <Truck size={14} />
                            <span>Mark Out for Delivery</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* Status: Ready for Pickup */}
                    {order.status === 'ready_for_pickup' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        disabled={updatingId === order.id}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle size={14} />
                        <span>Confirm Customer Picked Up (Complete Order)</span>
                      </button>
                    )}

                    {/* Status: Out for Delivery */}
                    {order.status === 'out_for_delivery' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        disabled={updatingId === order.id}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle size={14} />
                        <span>Confirm Delivered (Complete Order)</span>
                      </button>
                    )}

                    {/* Completed */}
                    {order.status === 'completed' && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle size={15} />
                        <span>Fulfillment Completed (Never Expires)</span>
                      </span>
                    )}

                    {/* WhatsApp Customer direct button */}
                    {order.customer_phone && (
                      <a
                        href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hi ${order.customer_name}! Updating you regarding your E-Bazaar order ${order.order_number}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl text-xs font-bold glass-pill text-emerald-800 hover:bg-emerald-50 flex items-center gap-1 border border-emerald-300"
                      >
                        <MessageSquare size={13} />
                        <span>Message Customer</span>
                      </a>
                    )}

                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto">
          <ClipboardList size={40} className="mx-auto text-stone-400 mb-3" />
          <h3 className="font-bold text-base text-stone-800">No orders in this status group</h3>
          <p className="text-xs text-stone-500 mt-1">Check other tabs to inspect order history or pending requests.</p>
        </div>
      )}

    </div>
  );
};
