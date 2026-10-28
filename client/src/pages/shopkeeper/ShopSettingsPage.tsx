import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Bell,
  User,
  Shield,
  LogOut,
  RefreshCw,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ShopSettingsPage: React.FC = () => {
  const { user, shop, logout } = useAuth();
  const navigate = useNavigate();

  const [orderAlerts, setOrderAlerts] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-800 uppercase tracking-wider mb-2">
          <Settings size={13} />
          <span>Shop Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          Shop Account & Notifications
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Manage alert sound triggers, WhatsApp messaging notifications, and merchant account actions.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle size={18} className="text-emerald-600" />
          <span>Preferences saved successfully!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl space-y-6">
        
        {/* Merchant Info */}
        <div className="p-4 rounded-2xl glass-pill bg-white/70 border border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
              <User size={20} />
            </div>
            <div>
              <div className="font-bold text-sm text-stone-900">{user?.name}</div>
              <div className="text-xs text-stone-500">{user?.email} • {shop?.name}</div>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
            Shopkeeper
          </span>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            <Bell size={15} />
            <span>Order Alert Preferences</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl glass-pill cursor-pointer">
              <div>
                <div className="font-semibold text-xs text-stone-800">Real-time Order Alerts</div>
                <div className="text-[11px] text-stone-400">Receive pop-up alert banners when customers reserve products</div>
              </div>
              <input
                type="checkbox"
                checked={orderAlerts}
                onChange={(e) => setOrderAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl glass-pill cursor-pointer">
              <div>
                <div className="font-semibold text-xs text-stone-800">WhatsApp Notification Links</div>
                <div className="text-[11px] text-stone-400">Generate pre-formatted WhatsApp chat links for quick customer updates</div>
              </div>
              <input
                type="checkbox"
                checked={whatsappNotifications}
                onChange={(e) => setWhatsappNotifications(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl glass-pill cursor-pointer">
              <div>
                <div className="font-semibold text-xs text-stone-800">Sound Chime on New Orders</div>
                <div className="text-[11px] text-stone-400">Play an audible chime when new customer reservation comes in</div>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm"
        >
          Save Preferences
        </button>

      </form>

      {/* Account Switcher & Sign Out */}
      <div className="glass-panel p-6 rounded-3xl border border-white shadow-xl space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-stone-600">
          Account Actions
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-stone-800 glass-pill hover:bg-emerald-50 transition border border-stone-200 flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} className="text-emerald-600" />
            <span>Browse Marketplace as Customer</span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="py-3 px-6 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

    </div>
  );
};
