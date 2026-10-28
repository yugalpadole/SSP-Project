import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LogIn,
  AlertCircle,
  ArrowLeft,
  Home,
  Eye,
  EyeOff,
  User,
  Store,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Role tab state (defaults to 'customer' or read from query param ?role=...)
  const initialRole = searchParams.get('role') === 'shopkeeper' ? 'shopkeeper' : 'customer';
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mismatchRole, setMismatchRole] = useState<UserRole | null>(null);
  const [justAutofilled, setJustAutofilled] = useState(false);

  // Sync role from URL if changed
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'shopkeeper' || roleParam === 'customer') {
      setActiveRole(roleParam);
    }
  }, [searchParams]);

  // If already logged in, redirect to respective destination
  useEffect(() => {
    if (user) {
      if (user.role === 'shopkeeper') {
        navigate('/shopkeeper/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleRoleSwitch = (newRole: UserRole) => {
    if (newRole === activeRole) return;
    setActiveRole(newRole);
    setSearchParams({ role: newRole });
    setError(null);
    setMismatchRole(null);
    setJustAutofilled(false);
  };

  const handleAutofill = () => {
    if (activeRole === 'customer') {
      setEmailOrPhone('customer@ebazaar.com');
      setPassword('password123');
    } else {
      setEmailOrPhone('shopkeeper@ebazaar.com');
      setPassword('password123');
    }
    setError(null);
    setMismatchRole(null);
    setJustAutofilled(true);
    setTimeout(() => {
      setJustAutofilled(false);
    }, 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setError('Please enter your email address or phone number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMismatchRole(null);

    try {
      const data = await login(emailOrPhone.trim(), password, activeRole);

      // Explicit role validation guard: strictly ensure customer !== shopkeeper
      if (data.user.role !== activeRole) {
        setMismatchRole(data.user.role);
        setError(
          data.user.role === 'shopkeeper'
            ? 'This account is registered as a Shopkeeper (Merchant). You cannot sign in as a Customer.'
            : 'This account is registered as a Customer. You cannot sign in to the Shopkeeper portal.'
        );
        return;
      }

      if (data.user.role === 'shopkeeper') {
        navigate('/shopkeeper/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (err.roleMismatch && err.actualRole) {
        setMismatchRole(err.actualRole);
        setError(err.message);
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isCustomer = activeRole === 'customer';

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Return to Homepage Button */}
      <div className="max-w-md w-full mb-3 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-900 bg-white/90 hover:bg-emerald-50 border border-emerald-200/90 shadow-xs transition hover:scale-102 group cursor-pointer"
          id="login-return-homepage"
        >
          <ArrowLeft size={14} className="text-emerald-600 transition-transform group-hover:-translate-x-1" />
          <Home size={14} className="text-emerald-600" />
          <span>Return to Homepage</span>
        </Link>
      </div>

      <div className="glass-panel-elevated max-w-md w-full p-8 rounded-3xl relative border border-white/80 shadow-2xl transition-all">
        {/* Brand Header */}
        <div className="text-center mb-5">
          <Link to="/" className="inline-block mb-2">
            <img src="/name.png" alt="eBazaar" className="h-10 w-auto mx-auto drop-shadow-sm" />
          </Link>
          <h2 className="text-2xl font-black text-stone-900 mt-1 font-heading">
            {isCustomer ? 'Customer Sign In' : 'Shopkeeper Sign In'}
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-1">
            {isCustomer
              ? 'Access your shopping basket, track live orders & fast delivery'
              : 'Access your merchant portal, manage inventory & incoming orders'}
          </p>
        </div>

        {/* Role Switcher Button Tabs */}
        <div className="mb-6">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Select Account Type</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isCustomer ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isCustomer ? 'Shopper Mode' : 'Merchant Mode'}
            </span>
          </div>

          <div
            className="grid grid-cols-2 p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200 shadow-inner gap-1"
            role="tablist"
            aria-label="Account Type"
          >
            {/* Customer Switch Button */}
            <button
              type="button"
              role="tab"
              aria-selected={isCustomer}
              onClick={() => handleRoleSwitch('customer')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isCustomer
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-700/20'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
              id="switch-to-customer-btn"
            >
              <User size={15} className={isCustomer ? 'text-white' : 'text-stone-500'} />
              <span>Customer</span>
            </button>

            {/* Shopkeeper Switch Button */}
            <button
              type="button"
              role="tab"
              aria-selected={!isCustomer}
              onClick={() => handleRoleSwitch('shopkeeper')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isCustomer
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-700/20'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
              id="switch-to-shopkeeper-btn"
            >
              <Store size={15} className={!isCustomer ? 'text-white' : 'text-stone-500'} />
              <span>Shopkeeper</span>
            </button>
          </div>
        </div>

        {/* Role Mismatch Warning Alert with Quick Switch Action */}
        {mismatchRole && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-2.5">
              <ShieldAlert size={18} className="shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p className="font-bold">Role Mismatch Detected</p>
                <p className="leading-relaxed text-amber-800">
                  {error ||
                    `This account is registered as a ${
                      mismatchRole === 'shopkeeper' ? 'Shopkeeper' : 'Customer'
                    }. Please switch to the correct portal tab to proceed.`}
                </p>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch(mismatchRole)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition cursor-pointer"
                  id="switch-mismatch-role-btn"
                >
                  <span>
                    Switch to {mismatchRole === 'shopkeeper' ? 'Shopkeeper' : 'Customer'} Sign In
                  </span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Standard Error Alert (when not a mismatch) */}
        {error && !mismatchRole && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Email Address or Phone Number
            </label>
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => {
                setEmailOrPhone(e.target.value);
                if (error) setError(null);
                if (mismatchRole) setMismatchRole(null);
              }}
              placeholder={
                isCustomer
                  ? 'customer@ebazaar.com or 9876543201'
                  : 'shopkeeper@ebazaar.com or 9876543210'
              }
              required
              autoComplete="username"
              className={`glass-input w-full px-3.5 py-2.5 rounded-xl text-sm transition ${
                isCustomer ? 'focus:ring-emerald-500' : 'focus:ring-amber-500'
              }`}
              id="login-email-input"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700">Password</label>
              <Link
                to="/forgot-password"
                className={`text-xs font-semibold hover:underline ${
                  isCustomer ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                  if (mismatchRole) setMismatchRole(null);
                }}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className={`glass-input w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm transition ${
                  isCustomer ? 'focus:ring-emerald-500' : 'focus:ring-amber-500'
                }`}
                id="login-password-input"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
              isCustomer
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-700/25'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-amber-700/25'
            }`}
            id="login-submit-btn"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            <span>
              {isLoading
                ? 'Verifying Credentials...'
                : isCustomer
                ? 'Sign In as Customer'
                : 'Sign In as Shopkeeper'}
            </span>
          </button>
        </form>

        {/* Autofill Button (Replacing old demo buttons) */}
        <div className="mt-5 p-3 rounded-2xl bg-stone-50 border border-stone-200/90 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles
                size={13}
                className={isCustomer ? 'text-emerald-600' : 'text-amber-600'}
              />
              <span>Need Quick Access?</span>
            </span>
            <span className="text-[10px] text-stone-400 font-medium">1-Click Login</span>
          </div>

          <button
            type="button"
            onClick={handleAutofill}
            className={`w-full px-3 py-2 rounded-xl border font-semibold text-xs transition flex items-center justify-between group cursor-pointer ${
              justAutofilled
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white hover:bg-stone-100/90 border-stone-200 text-stone-800 shadow-2xs hover:border-stone-300'
            }`}
            id="autofill-credentials-btn"
          >
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg ${
                  isCustomer
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {justAutofilled ? (
                  <CheckCircle2 size={14} className="text-emerald-600 animate-in zoom-in" />
                ) : (
                  <Sparkles size={14} />
                )}
              </div>
              <div className="text-left">
                <div className="font-bold leading-tight">
                  {justAutofilled
                    ? 'Credentials Autofilled!'
                    : `Autofill ${isCustomer ? 'Customer' : 'Shopkeeper'} Credentials`}
                </div>
                <div className="text-[10px] text-stone-500">
                  {isCustomer ? 'customer@ebazaar.com' : 'shopkeeper@ebazaar.com'}
                </div>
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                justAutofilled
                  ? 'bg-emerald-200 text-emerald-900'
                  : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'
              }`}
            >
              {justAutofilled ? 'Filled ✓' : 'Autofill'}
            </span>
          </button>
        </div>

        {/* Register CTA */}
        <div className="mt-6 pt-5 border-t border-stone-200/60 text-center text-xs text-stone-500">
          {isCustomer ? (
            <>
              Don't have a customer account?{' '}
              <Link
                to="/register"
                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Create Customer Account
              </Link>
            </>
          ) : (
            <>
              Want to sell on eBazaar?{' '}
              <Link
                to="/register"
                className="font-bold text-amber-700 hover:text-amber-800 hover:underline"
              >
                Register Your Shop
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
