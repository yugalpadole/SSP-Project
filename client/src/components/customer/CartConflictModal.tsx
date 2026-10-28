import React from 'react';
import { AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartConflictModal: React.FC = () => {
  const { conflictingItem, resolveConflict, activeShopName } = useCart();

  if (!conflictingItem) return null;

  const newShopName = conflictingItem.product.shop_name || 'Different Shop';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel-elevated w-full max-w-md rounded-2xl p-6 relative text-stone-800 shadow-2xl border border-amber-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-amber-100 text-amber-700">
            <AlertCircle size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Replace Cart Items?</h3>
            <p className="text-xs text-stone-500">Your cart can only contain items from one shop at a time</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 mb-5 text-sm text-stone-700">
          <p className="mb-2">
            Your cart already has items from <strong className="text-emerald-800">{activeShopName || 'another shop'}</strong>.
          </p>
          <p className="text-xs text-stone-600">
            Adding <strong className="text-stone-900">{conflictingItem.product.name}</strong> from{' '}
            <strong className="text-emerald-800">{newShopName}</strong> will discard your existing items.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => resolveConflict(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 transition"
          >
            Keep Current Cart
          </button>
          <button
            onClick={() => resolveConflict(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition shadow-lg shadow-emerald-700/20 flex items-center gap-2"
          >
            <span>Start New Cart</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
