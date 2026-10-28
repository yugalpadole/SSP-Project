import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, CheckCircle, AlertCircle, Home, Eye, EyeOff } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password reset failed');
      }

      setMessage('Your password has been successfully reset. You may now log in.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Return to Homepage Button */}
      <div className="max-w-md w-full mb-3 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-900 bg-white/90 hover:bg-emerald-50 border border-emerald-200/90 shadow-xs transition hover:scale-102 group cursor-pointer"
          id="forgot-password-return-homepage"
        >
          <ArrowLeft size={14} className="text-emerald-600 transition-transform group-hover:-translate-x-1" />
          <Home size={14} className="text-emerald-600" />
          <span>Return to Homepage</span>
        </Link>
      </div>

      <div className="glass-panel-elevated max-w-md w-full p-8 rounded-3xl relative border border-white/80 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-100 text-emerald-700 mb-3">
            <KeyRound size={28} />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Reset Your Password</h2>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Enter your registered email and choose a new secure password
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle size={18} className="shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {!message ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Account Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@ebazaar.com"
                required
                className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="glass-input w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm"
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

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  minLength={6}
                  className="glass-input w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-700/20"
            >
              {isSubmitting ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <Link
            to="/login"
            className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md flex items-center justify-center gap-2"
          >
            <span>Proceed to Sign In</span>
          </Link>
        )}

        <div className="mt-6 pt-5 border-t border-stone-200/60 text-center">
          <Link
            to="/login"
            className="text-xs font-semibold text-stone-600 hover:text-emerald-700 inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
