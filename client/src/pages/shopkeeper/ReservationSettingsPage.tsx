import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ReservationSettingsPage: React.FC = () => {
  const { shop, updateShop } = useAuth();
  const shopId = shop?.id;

  const [expiryMinutes, setExpiryMinutes] = useState(60);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (!shopId) return;
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/shopkeeper/reservation-settings?shopId=${shopId}`, {
          headers: { 'x-shop-id': String(shopId) },
        });
        const data = await res.json();
        if (res.ok && data.reservation_expiry_minutes) {
          setExpiryMinutes(data.reservation_expiry_minutes);
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
      const res = await fetch('/api/shopkeeper/reservation-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-shop-id': String(shopId) },
        body: JSON.stringify({ reservationExpiryMinutes: Number(expiryMinutes) }),
      });

      if (res.ok) {
        updateShop({ reservation_expiry_minutes: Number(expiryMinutes) });
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const presetOptions = [30, 45, 60, 90, 120, 180];

  return (
    <div className="space-y-8 pb-16 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider mb-2">
          <Clock size={13} />
          <span>Reserve & Collect Rules</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          Pickup Reservation Rules & Expiry
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Configure how long reserved stock is held at your counter before being automatically released back to inventory.
        </p>
      </div>

      {/* Rules Explanatory Box */}
      <div className="glass-panel p-6 rounded-3xl border border-white shadow-xl space-y-3 bg-amber-50/40 border-amber-200/60">
        <div className="flex items-center gap-2 font-bold text-xs text-amber-950 uppercase tracking-wider">
          <ShieldCheck size={16} className="text-amber-600" />
          <span>Automatic Inventory Protection System</span>
        </div>
        <ul className="space-y-2 text-xs text-stone-700 list-disc list-inside">
          <li>
            <strong>Safe Stock Allocation:</strong> When a customer reserves items, the available stock is reduced immediately so items are never double-booked.
          </li>
          <li>
            <strong>Strict Single-Release Guarantee:</strong> If a reservation expires or is cancelled, reserved stock is released back into available inventory <em>exactly once</em>.
          </li>
          <li>
            <strong>Completed Orders Never Expire:</strong> Once an order is completed, it remains archived permanently as a finalized sale.
          </li>
        </ul>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle size={18} className="text-emerald-600" />
          <span>Reservation rules updated successfully!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl space-y-6">
        
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Reservation Validity Window (Minutes)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={15}
              max={360}
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(Number(e.target.value))}
              required
              className="glass-input px-4 py-3 rounded-xl text-lg font-black text-stone-900 w-36 text-center"
            />
            <span className="text-sm font-semibold text-stone-600">
              Minutes ({Math.floor(expiryMinutes / 60)}h {expiryMinutes % 60}m)
            </span>
          </div>
          <span className="text-[11px] text-stone-400 mt-2 block">
            Recommended: 60 minutes for groceries & produce; 120 minutes for electronics & apparel.
          </span>
        </div>

        {/* Quick Presets */}
        <div>
          <span className="block text-xs font-bold text-stone-600 mb-2">
            Quick Preset Windows
          </span>
          <div className="flex flex-wrap gap-2">
            {presetOptions.map((mins) => (
              <button
                type="button"
                key={mins}
                onClick={() => setExpiryMinutes(mins)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  expiryMinutes === mins
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'glass-pill text-stone-700 hover:bg-white'
                }`}
              >
                {mins} Mins ({mins >= 60 ? `${mins / 60} hr` : `${mins} m`})
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-700/20"
        >
          {isSaving ? 'Updating Rules...' : 'Save Reservation Settings'}
        </button>

      </form>

    </div>
  );
};
