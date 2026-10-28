import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  Clock,
  MapPin,
  Store,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Phone,
  User,
  ShoppingBag
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { Shop, CustomerAddress, OrderType } from '../../types';

export const CheckoutPage: React.FC = () => {
  const { items, activeShopId, activeShopName, subtotal, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const { currentLocality } = useLocation();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [shop, setShop] = useState<Shop | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Form fields
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '+91 9876543201');
  const [deliveryStreet, setDeliveryStreet] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync recipient details when user loads or changes
  useEffect(() => {
    if (user) {
      if (user.name) setRecipientName(user.name);
      if (user.phone) setRecipientPhone(user.phone);
    }
  }, [user]);

  // Fetch shop details for delivery fees and reservation expiry
  useEffect(() => {
    if (!activeShopId) return;

    const fetchShopAndAddresses = async () => {
      try {
        const [shopRes, addrRes] = await Promise.all([
          fetch(`/api/shops/${activeShopId}`),
          user ? fetch(`/api/users/addresses`, { headers: { 'x-user-id': String(user.id) } }) : null,
        ]);

        const shopData = await shopRes.json();
        if (shopRes.ok) {
          setShop(shopData.shop);
        }

        if (addrRes && addrRes.ok) {
          const addrData = await addrRes.json();
          setAddresses(Array.isArray(addrData) ? addrData : []);
          if (addrData.length > 0) {
            setSelectedAddressId(addrData[0].id);
            setDeliveryStreet(addrData[0].street);
          }
        }
      } catch (err) {
        console.error('Error fetching checkout info', err);
      }
    };

    fetchShopAndAddresses();
  }, [activeShopId, user]);

  if (items.length === 0) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto my-16 border border-white shadow-xl">
        <h2 className="text-xl font-bold text-stone-900 font-heading">Your cart is empty</h2>
        <Link to="/products" className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 inline-block">
          Explore Products
        </Link>
      </div>
    );
  }

  const deliveryCharge = orderType === 'delivery' ? (shop?.delivery_charge || 25) : 0;
  const totalAmount = subtotal + deliveryCharge;
  const reservationMinutes = shop?.reservation_expiry_minutes || 60;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('Please sign in or create an account to place and track your order.');
      }

      if (!recipientName.trim() || !recipientPhone.trim()) {
        throw new Error('Please enter recipient name and phone number.');
      }

      let finalAddress = null;
      if (orderType === 'delivery') {
        if (!deliveryStreet.trim()) {
          throw new Error('Please enter complete delivery address.');
        }
        finalAddress = `${deliveryStreet.trim()}, ${currentLocality.name}, ${currentLocality.city} - ${currentLocality.pincode}`;
      }

      const payload = {
        customerId: user.id,
        customerName: recipientName.trim(),
        customerPhone: recipientPhone.trim(),
        shopId: activeShopId,
        orderType,
        deliveryAddress: finalAddress,
        customerNotes: customerNotes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete order');
      }

      clearCart();
      navigate('/orders');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title */}
      <div className="glass-panel p-6 rounded-3xl border border-white shadow-md">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-heading">Fulfillment & Checkout</h1>
        <p className="text-xs text-stone-500 mt-1">
          Ordering from <strong>{activeShopName}</strong> ({totalItems} items)
        </p>
      </div>

      {!user && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="shrink-0 text-amber-600" />
            <div>
              <strong className="block text-sm font-bold text-amber-950 font-heading">Sign In Required to Place Order</strong>
              <span className="text-stone-600">Please sign in or register so your order is saved to your account in our database for tracking.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 transition"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Choose Delivery vs Reserve & Collect */}
            <div className="glass-panel p-6 rounded-3xl border border-white shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
                1. Select Fulfillment Method
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Home Delivery Card */}
                <div
                  onClick={() => setOrderType('delivery')}
                  className={`p-5 rounded-2xl cursor-pointer border-2 transition-all ${
                    orderType === 'delivery'
                      ? 'bg-emerald-50/80 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                      : 'glass-panel border-stone-200 hover:border-emerald-300'
                  }`}
                  id="checkout-option-delivery"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2.5 rounded-xl ${orderType === 'delivery' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                      <Truck size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">Home Delivery</h4>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        ₹{shop?.delivery_charge || 25} Delivery Fee
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    The shopkeeper delivers directly to your address in <strong>{shop?.estimated_delivery_time || '25-40 mins'}</strong>.
                  </p>
                </div>

                {/* Reserve & Collect Card */}
                <div
                  onClick={() => setOrderType('reserve_collect')}
                  className={`p-5 rounded-2xl cursor-pointer border-2 transition-all ${
                    orderType === 'reserve_collect'
                      ? 'bg-amber-50/80 border-amber-600 shadow-md ring-2 ring-amber-500/20'
                      : 'glass-panel border-stone-200 hover:border-amber-300'
                  }`}
                  id="checkout-option-reserve"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2.5 rounded-xl ${orderType === 'reserve_collect' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
                      <Clock size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">Reserve & Collect</h4>
                      <span className="text-[10px] text-amber-700 font-black uppercase">
                        Zero Fee (FREE)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Items are reserved exclusively for you at the counter for <strong>{reservationMinutes} minutes</strong>. Collect when ready!
                  </p>
                </div>

              </div>
            </div>

            {/* Step 2: Contact & Address */}
            <div className="glass-panel p-6 rounded-3xl border border-white shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
                2. Contact & {orderType === 'delivery' ? 'Delivery Address' : 'Pickup Details'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    required
                    placeholder="e.g. Rahul Verma"
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    required
                    placeholder="e.g. +91 9876543201"
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              {orderType === 'delivery' ? (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Street Address & Flat / House #
                  </label>
                  <input
                    type="text"
                    value={deliveryStreet}
                    onChange={(e) => setDeliveryStreet(e.target.value)}
                    required
                    placeholder="e.g. Flat 304, Green Palms Residency, 5th Cross"
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                  <div className="p-3 rounded-xl glass-pill text-xs text-stone-600 flex items-center gap-2">
                    <MapPin size={15} className="text-emerald-600 shrink-0" />
                    <span>Delivering within: <strong>{currentLocality.name}, {currentLocality.city} - {currentLocality.pincode}</strong></span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Store size={16} />
                    <span>Store Pickup Location</span>
                  </div>
                  <div className="text-xs text-stone-700">
                    <strong>{shop?.name}</strong> <br />
                    {shop?.address}, {shop?.locality} • PIN {shop?.pincode}
                  </div>
                  <div className="text-[11px] text-amber-800">
                    * Reservation remains active for <strong>{reservationMinutes} minutes</strong> from order confirmation. If unclaimed, products return to shelf stock automatically.
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Special Notes for Shopkeeper (Optional)
                </label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Please pick ripe tomatoes, or ring doorbell twice"
                  className="glass-input w-full px-3.5 py-2 text-xs rounded-xl"
                />
              </div>
            </div>

          </div>

          {/* Right Summary */}
          <div className="lg:col-span-4">
            <div className="glass-panel p-6 rounded-3xl border border-white shadow-xl space-y-5 sticky top-28">
              <h3 className="font-bold text-base text-stone-900 border-b border-stone-200/60 pb-3">
                Final Bill
              </h3>

              {/* Items summary */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={i.product.id} className="flex justify-between text-xs text-stone-600">
                    <span className="truncate max-w-[180px]">{i.product.name} × {i.quantity}</span>
                    <span className="font-semibold text-stone-900">₹{i.product.price * i.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-200/60 pt-3 space-y-2 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-stone-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-semibold text-emerald-800">
                    {orderType === 'delivery' ? `₹${deliveryCharge}` : 'FREE (Pickup)'}
                  </span>
                </div>
              </div>

              <div className="border-t border-stone-200/60 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-900">Total Payable:</span>
                <span className="text-2xl font-black text-emerald-800">₹{totalAmount}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2"
                id="checkout-confirm-order-btn"
              >
                <CheckCircle size={18} />
                <span>
                  {isSubmitting
                    ? 'Processing...'
                    : orderType === 'delivery'
                    ? `Place Delivery Order (₹${totalAmount})`
                    : `Confirm Free Reservation (₹${totalAmount})`}
                </span>
              </button>

              <div className="text-[11px] text-center text-stone-400">
                Pay directly to shopkeeper upon delivery or collection.
              </div>
            </div>
          </div>

        </div>
      </form>

    </div>
  );
};
