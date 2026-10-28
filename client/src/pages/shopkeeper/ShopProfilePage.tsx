import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, MessageSquare, Clock, CheckCircle, Image, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ShopProfilePage: React.FC = () => {
  const { shop, updateShop } = useAuth();

  const [name, setName] = useState(shop?.name || '');
  const [description, setDescription] = useState(shop?.description || '');
  const [category, setCategory] = useState(shop?.category || 'Groceries');
  const [address, setAddress] = useState(shop?.address || '');
  const [locality, setLocality] = useState(shop?.locality || 'Yevalewadi');
  const [pincode, setPincode] = useState(shop?.pincode || '411048');
  const [phone, setPhone] = useState(shop?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(shop?.whatsapp_number || '');
  const [openingHours, setOpeningHours] = useState(shop?.opening_hours || '8:00 AM - 9:30 PM');
  const [logoUrl, setLogoUrl] = useState(shop?.logo_url || '');
  const [bannerUrl, setBannerUrl] = useState(shop?.banner_url || '');

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (shop) {
      setName(shop.name);
      setDescription(shop.description);
      setCategory(shop.category);
      setAddress(shop.address);
      setLocality(shop.locality);
      setPincode(shop.pincode);
      setPhone(shop.phone);
      setWhatsappNumber(shop.whatsapp_number);
      setOpeningHours(shop.opening_hours);
      setLogoUrl(shop.logo_url);
      setBannerUrl(shop.banner_url);
    }
  }, [shop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const shopId = shop?.id;
    if (!shopId) return;
    setIsSaving(true);
    setSuccessMsg(false);

    try {
      const payload = {
        shopId,
        name,
        description,
        category,
        address,
        locality,
        pincode,
        phone,
        whatsappNumber,
        openingHours,
        logoUrl,
        bannerUrl,
      };

      const res = await fetch('/api/shopkeeper/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-shop-id': String(shopId) },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        updateShop(updated);
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
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider mb-2">
            <Store size={13} />
            <span>Storefront Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            Edit Shop Profile & Contacts
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Update how your shop appears to neighborhood customers in search results and storefront pages.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle size={18} className="text-emerald-600" />
          <span>Shop profile details updated successfully!</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl space-y-6">
        
        {/* Banner Preview */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Storefront Banner Preview
          </label>
          <div className="relative h-40 rounded-2xl overflow-hidden bg-stone-200 border border-stone-200">
            <img
              src={bannerUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80'}
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-3">
              <img
                src={logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'}
                alt="Logo"
                className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow"
              />
              <span className="text-white font-bold text-sm drop-shadow">{name || 'Shop Name'}</span>
            </div>
          </div>
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Shop Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Shop Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
            >
              <option value="Groceries">Daily Groceries</option>
              <option value="Fruits & Vegetables">Fruits & Vegetables</option>
              <option value="Electronics">Electronics & Accessories</option>
              <option value="Fashion">Fashion & Apparel</option>
              <option value="Stationery">Stationery & Books</option>
              <option value="Personal Care">Personal Care</option>
              <option value="Home Essentials">Home Essentials</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Shop Description / Bio
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="glass-input w-full p-3 rounded-xl text-xs sm:text-sm"
            placeholder="Tell customers about your fresh specialties, farm connections, or unique offerings..."
          />
        </div>

        {/* Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-200/60">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              WhatsApp Business Number
            </label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              required
              className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Opening Hours
            </label>
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              placeholder="e.g. 8:00 AM - 9:30 PM"
              className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Address and Locality */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-200/60">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Physical Store Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Locality / Neighborhood
            </label>
            <input
              type="text"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              required
              className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Photo URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200/60">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Logo Photo URL
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Banner Photo URL
            </label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-700/20"
        >
          {isSaving ? 'Updating Store Profile...' : 'Save Profile Changes'}
        </button>

      </form>

    </div>
  );
};
