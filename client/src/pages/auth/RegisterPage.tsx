import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Store, ShieldCheck, ArrowRight, AlertCircle, ShoppingBag, ArrowLeft, Home, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { SEO } from '../../components/common/SEO';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Role selection state
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');

  // Common user fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');

  // Shopkeeper specific fields
  const [shopName, setShopName] = useState('');
  const [shopCategory, setShopCategory] = useState('Groceries');
  const [locality, setLocality] = useState('Yevalewadi');
  const [address, setAddress] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload: any = {
        name,
        email,
        password,
        phone,
        role: selectedRole,
      };

      if (selectedRole === 'shopkeeper') {
        payload.shopName = shopName || `${name}'s Store`;
        payload.shopCategory = shopCategory;
        payload.locality = locality;
        payload.address = address || `${locality}, Main Market`;
        payload.whatsappNumber = whatsappNumber || phone;
      }

      const res = await register(payload);
      if (res.user.role === 'shopkeeper') {
        navigate('/shopkeeper/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Create Account"
        description="Join eBazaar as a Customer or Shopkeeper. Connect with local markets digitally."
      />
      {/* Return to Homepage Button */}
      <div className="max-w-2xl w-full mb-3 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-900 bg-white/90 hover:bg-emerald-50 border border-emerald-200/90 shadow-xs transition hover:scale-102 group cursor-pointer"
          id="register-return-homepage"
        >
          <ArrowLeft size={14} className="text-emerald-600 transition-transform group-hover:-translate-x-1" />
          <Home size={14} className="text-emerald-600" />
          <span>Return to Homepage</span>
        </Link>
      </div>

      <div className="glass-panel-elevated max-w-2xl w-full p-8 rounded-3xl relative border border-white/80 shadow-2xl">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <img src="/name.png" alt="eBazaar" className="h-10 sm:h-11 w-auto mx-auto drop-shadow-sm" />
          </Link>
          <h2 className="text-xl font-bold text-stone-900">Create Your E-Bazaar Account</h2>
          <p className="text-xs text-stone-500 font-medium mt-1">
            First, choose your account type to configure your personalized experience
          </p>
        </div>

        {/* Step 1: Role Selection Cards */}
        <div className="mb-8">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-3 text-center">
            Select Your Role
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Customer Option Card */}
            <div
              onClick={() => setSelectedRole('customer')}
              className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                selectedRole === 'customer'
                  ? 'bg-emerald-50/80 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                  : 'glass-panel border-stone-200/80 hover:border-emerald-300'
              }`}
              id="role-select-customer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2.5 rounded-xl ${selectedRole === 'customer' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                  <User size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">I am a Customer</h4>
                  <span className="text-[10px] text-emerald-700 font-semibold uppercase">Shopper</span>
                </div>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Discover nearby local shops, compare real prices, order home delivery or reserve products for quick store pickup.
              </p>
            </div>

            {/* Shopkeeper Option Card */}
            <div
              onClick={() => setSelectedRole('shopkeeper')}
              className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                selectedRole === 'shopkeeper'
                  ? 'bg-amber-50/80 border-amber-600 shadow-md ring-2 ring-amber-500/20'
                  : 'glass-panel border-stone-200/80 hover:border-amber-300'
              }`}
              id="role-select-shopkeeper"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2.5 rounded-xl ${selectedRole === 'shopkeeper' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
                  <Store size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">I am a Shopkeeper</h4>
                  <span className="text-[10px] text-amber-700 font-semibold uppercase">Merchant</span>
                </div>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                List your store, showcase your products, manage live inventory, and accept online pickup reservations and deliveries.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 2: Details Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                required
                className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                id="register-name-input"
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
                placeholder="e.g. +91 9876543210"
                required
                className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                id="register-phone-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                id="register-email-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="glass-input w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm"
                  id="register-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Additional fields for shopkeeper */}
          {selectedRole === 'shopkeeper' && (
            <div className="p-5 rounded-2xl glass-panel bg-amber-50/40 border border-amber-200/60 space-y-4 animate-in fade-in">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Store size={15} />
                <span>Shop Profile Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Store / Shop Name
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Ramesh Supermart"
                    required={selectedRole === 'shopkeeper'}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Store Category
                  </label>
                  <select
                    value={shopCategory}
                    onChange={(e) => setShopCategory(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
                  >
                    <option value="Groceries">Daily Groceries</option>
                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                    <option value="Electronics">Electronics & Mobile</option>
                    <option value="Fashion">Fashion & Apparel</option>
                    <option value="Stationery">Stationery & Books</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Home Essentials">Home Essentials</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Locality / Neighborhood
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
                  >
                    <option value="Yevalewadi">Yevalewadi</option>
                    <option value="Khadakwasla">Khadakwasla</option>
                    <option value="Wagholi">Wagholi</option>
                    <option value="Uruli Kanchan">Uruli Kanchan</option>
                    <option value="Undri & Pisoli">Undri & Pisoli</option>
                    <option value="Pirangut">Pirangut</option>
                    <option value="Alandi Rural">Alandi Rural</option>
                    <option value="Dhayari Gaon">Dhayari Gaon</option>
                    <option value="Khed Shivapur">Khed Shivapur</option>
                    <option value="Saswad Rural">Saswad Rural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    WhatsApp Business Number
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Store Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop #, Street, Near Landmark"
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white transition shadow-lg flex items-center justify-center gap-2 ${
              selectedRole === 'customer'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-700/25'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-amber-700/25'
            }`}
            id="register-submit-btn"
          >
            <span>{isLoading ? 'Creating Your Account...' : `Register as ${selectedRole === 'customer' ? 'Customer' : 'Shopkeeper'}`}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Login CTA */}
        <div className="mt-6 pt-5 border-t border-stone-200/60 text-center text-xs text-stone-500">
          Already registered on E-Bazaar?{' '}
          <Link
            to="/login"
            className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
