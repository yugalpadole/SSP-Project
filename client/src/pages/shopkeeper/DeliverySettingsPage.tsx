import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DeliverySettingsPage: React.FC = () => {
  const { shop, updateShop } = useAuth();
  const shopId = shop?.id;

  const [isDeliveryEnabled, setIsDeliveryEnabled] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState(25);
  const [minOrderAmount, setMinOrderAmount] = useState(99);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('25-40 mins');
  const [serviceableAreas, setServiceableAreas] = useState('Yevalewadi, Kondhwa Budruk, Pisoli, Undri, Saswad Rural');

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (!shopId) return;
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/shopkeeper/delivery-settings?shopId=${shopId}`, {
          headers: { 'x-shop-id': String(shopId) },
        });
        const data = await res.json();
        if (res.ok) {
          setIsDeliveryEnabled(Boolean(data.is_delivery_enabled));
          setDeliveryCharge(data.delivery_charge || 25);
          setMinOrderAmount(data.min_order_amount || 99);
          setEstimatedDeliveryTime(data.estimated_delivery_time || '25-40 mins');
          setServiceableAreas(data.serviceable_areas || '');
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSettings();
  }, [shopId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(false);

    try {
      const payload = {
        isDeliveryEnabled,
        deliveryCharge: Number(deliveryCharge),
        minOrderAmount: Number(minOrderAmount),
        estimatedDeliveryTime,
        serviceableAreas,
      };

      const res = await fetch('/api/shopkeeper/delivery-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-shop-id': String(shopId) },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        updateShop({
          is_delivery_enabled: isDeliveryEnabled ? 1 : 0,
          delivery_charge: deliveryCharge,
          min_order_amount: minOrderAmount,
          estimated_delivery_time: estimatedDeliveryTime,
          serviceable_areas: serviceableAreas,
        });
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 uppercase tracking-wider mb-2">
          <Truck size={13} />
          <span>Local Logistics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          Delivery Configuration
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Set up your own self-managed neighborhood deliveries, fees, and serviceable radius.
        </p>
      </div>

      {/* Important rule note */}
      <div className="p-4 rounded-2xl glass-panel bg-sky-50/60 border border-sky-200/80 flex items-start gap-3 text-xs text-sky-950">
        <Info size={18} className="text-sky-600 shrink-0 mt-0.5" />
        <div>
          <strong>Shopkeeper-Managed Deliveries:</strong> You or your shop staff deliver products directly to customers. No third-party delivery partners or commissions.
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle size={18} className="text-emerald-600" />
          <span>Delivery settings updated successfully!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl space-y-6">
        
        {/* Toggle Delivery */}
        <div className="p-4 rounded-2xl glass-pill bg-white/70 border border-stone-200 flex items-center justify-between">
          <div>
            <div className="font-bold text-sm text-stone-900">Offer Home Delivery</div>
            <div className="text-xs text-stone-500">
              When turned off, customers can only choose Reserve & Collect for store pickup.
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDeliveryEnabled}
              onChange={(e) => setIsDeliveryEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Numeric Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Delivery Fee (₹)
            </label>
            <input
              type="number"
              min={0}
              value={deliveryCharge}
              onChange={(e) => setDeliveryCharge(Number(e.target.value))}
              disabled={!isDeliveryEnabled}
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm disabled:opacity-50"
            />
            <span className="text-[11px] text-stone-400 mt-1 inline-block">
              Added to order total at checkout. Set ₹0 for free delivery.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Minimum Order Amount (₹)
            </label>
            <input
              type="number"
              min={0}
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(Number(e.target.value))}
              disabled={!isDeliveryEnabled}
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm disabled:opacity-50"
            />
            <span className="text-[11px] text-stone-400 mt-1 inline-block">
              Minimum subtotal required before customer can request home delivery.
            </span>
          </div>
        </div>

        {/* Estimated Time */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Estimated Delivery Timeframe
          </label>
          <input
            type="text"
            value={estimatedDeliveryTime}
            onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
            disabled={!isDeliveryEnabled}
            placeholder="e.g. 25-40 mins"
            className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm disabled:opacity-50"
          />
          <span className="text-[11px] text-stone-400 mt-1 inline-block">
            Displayed on your shop card and checkout screen.
          </span>
        </div>

        {/* Serviceable Areas */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Serviceable Localities & Radius
          </label>
          <textarea
            rows={3}
            value={serviceableAreas}
            onChange={(e) => setServiceableAreas(e.target.value)}
            disabled={!isDeliveryEnabled}
            placeholder="e.g. Yevalewadi Gaothan, Kondhwa Budruk, Pisoli, Undri, Saswad Road"
            className="glass-input w-full p-3 rounded-xl text-xs sm:text-sm disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-700/20"
        >
          {isSaving ? 'Saving Settings...' : 'Save Delivery Configuration'}
        </button>

      </form>

    </div>
  );
};
