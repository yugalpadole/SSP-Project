import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Plus,
  Trash2,
  CheckCircle,
  Settings,
  LogOut,
  Phone,
  Mail,
  ShieldCheck,
  RefreshCw,
  Home,
  Store
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CustomerAddress } from '../../types';

export const ProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // New address state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newRecipient, setNewRecipient] = useState(user?.name || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [newStreet, setNewStreet] = useState('');
  const [newLocality, setNewLocality] = useState('Yevalewadi');
  const [newPincode, setNewPincode] = useState('411048');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setNewRecipient(user.name || '');
      setNewPhone(user.phone || '');
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/users/addresses', {
        headers: { 'x-user-id': String(user.id) },
      });
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  if (!user) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto my-16 border border-white shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
          <User size={32} />
        </div>
        <h2 className="text-xl font-bold text-stone-900 font-heading">Sign In Required</h2>
        <p className="text-xs text-stone-500 mt-2 mb-6 max-w-sm mx-auto">
          Please log in to your eBazaar account to view your profile details and manage saved delivery addresses.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-700/20 inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Sign In to Your Account</span>
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdatingProfile(true);
    setProfileSuccessMsg(false);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': String(user.id) },
        body: JSON.stringify({ userId: user.id, name, phone }),
      });

      if (res.ok) {
        updateUser({ name, phone });
        setProfileSuccessMsg(true);
        setTimeout(() => setProfileSuccessMsg(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': String(user.id) },
        body: JSON.stringify({
          userId: user.id,
          label: newLabel,
          recipientName: newRecipient,
          phone: newPhone,
          street: newStreet,
          locality: newLocality,
          city: 'Pune',
          pincode: newPincode,
          isDefault: addresses.length === 0,
        }),
      });

      if (res.ok) {
        setShowAddAddress(false);
        setNewStreet('');
        fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': String(user.id) },
      });
      if (res.ok) {
        fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10 pb-16 max-w-4xl mx-auto">
      
      {/* Header Profile Hero */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
            alt={user.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-stone-900 font-heading">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">{user.email}</p>
            <p className="text-xs text-stone-500">{user.phone || 'No phone added'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user.role === 'shopkeeper' ? (
            <button
              onClick={() => navigate('/shopkeeper/dashboard')}
              className="px-4 py-2 rounded-xl text-xs font-bold glass-pill text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center gap-1.5 border border-amber-300 cursor-pointer"
            >
              <Store size={13} className="text-amber-700" />
              <span>Merchant Console</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 rounded-xl text-xs font-bold glass-pill text-emerald-900 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1.5 border border-emerald-300 cursor-pointer"
            >
              <Store size={13} className="text-emerald-700" />
              <span>List Your Shop</span>
            </button>
          )}

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Grid: Personal Details & Saved Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Edit Profile Form */}
        <div className="md:col-span-5 glass-panel p-6 rounded-3xl border border-white shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
            <User size={16} className="text-emerald-600" />
            <span>Personal Information</span>
          </h2>

          {profileSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle size={15} />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="glass-input w-full px-3 py-2 text-xs sm:text-sm rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="glass-input w-full px-3 py-2 text-xs sm:text-sm rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="glass-input w-full px-3 py-2 text-xs sm:text-sm rounded-xl opacity-60 bg-stone-100"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm"
            >
              {isUpdatingProfile ? 'Saving...' : 'Update Details'}
            </button>
          </form>
        </div>

        {/* Right: Saved Addresses */}
        <div className="md:col-span-7 glass-panel p-6 rounded-3xl border border-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <MapPin size={16} className="text-emerald-600" />
              <span>Saved Delivery Addresses ({addresses.length})</span>
            </h2>

            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Add New</span>
            </button>
          </div>

          {/* Add Address Form Toggle */}
          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-3 animate-in fade-in">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Label (Home / Work)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="glass-input text-xs px-3 py-2 rounded-xl"
                  required
                />
                <input
                  type="text"
                  placeholder="Recipient Name"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  className="glass-input text-xs px-3 py-2 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="glass-input text-xs px-3 py-2 rounded-xl"
                  required
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value)}
                  className="glass-input text-xs px-3 py-2 rounded-xl"
                  required
                />
              </div>

              <input
                type="text"
                placeholder="Flat / House #, Street, Landmark"
                value={newStreet}
                onChange={(e) => setNewStreet(e.target.value)}
                className="glass-input text-xs px-3 py-2 rounded-xl w-full"
                required
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-xl shadow-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          {/* Addresses list */}
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-4 rounded-2xl glass-pill bg-white/70 border border-white flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-stone-900">{addr.label}</span>
                    {Boolean(addr.is_default) && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {addr.street}, {addr.locality}, {addr.city} - {addr.pincode}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Contact: {addr.recipient_name} ({addr.phone})
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="p-2 text-stone-400 hover:text-red-600 transition"
                  title="Delete address"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
