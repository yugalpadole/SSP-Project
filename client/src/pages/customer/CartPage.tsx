import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Store,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Truck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { SEO } from '../../components/common/SEO';

export const CartPage: React.FC = () => {
  const { items, activeShopName, activeShopId, subtotal, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto my-16 border border-white shadow-xl">
        <SEO title="My Shopping Cart" description="Review items in your eBazaar shopping cart and proceed to checkout." />
        <div className="w-20 h-20 rounded-full bg-emerald-100/70 text-emerald-700 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={36} />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Your Basket is Empty</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-2 mb-6 max-w-sm mx-auto">
          Explore neighborhood shops and add fresh vegetables, fruits, staples, or accessories to your cart.
        </p>
        <Link
          to="/products"
          className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-lg shadow-emerald-700/20 inline-flex items-center gap-2"
        >
          <span>Start Shopping</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <SEO
        title={`Shopping Cart (${totalItems})`}
        description="Review selected items from your neighborhood shop and choose instant reserve & collect or home delivery."
      />
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-1">
            <ShoppingBag size={12} />
            <span>Review Your Cart</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900">
            Shopping Cart ({totalItems} items)
          </h1>
          <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
            <span>Items from:</span>
            <strong className="text-emerald-800 font-bold">{activeShopName}</strong>
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 hover:underline font-semibold flex items-center gap-1 self-start sm:self-auto"
        >
          <Trash2 size={13} />
          <span>Clear Entire Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Items List */}
        <div className="lg:col-span-8 space-y-3">
          {items.map(({ product, quantity }) => {
            const available = product.available_stock !== undefined ? product.available_stock : product.stock_quantity;
            return (
              <div
                key={product.id}
                className="glass-panel p-4 rounded-2xl border border-white flex flex-col sm:flex-row items-center justify-between gap-4 transition hover:shadow-md"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                  />
                  <div className="overflow-hidden">
                    <Link
                      to={`/products/${product.id}`}
                      className="font-bold text-sm text-stone-900 hover:text-emerald-700 line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <div className="text-xs text-stone-400 mt-0.5">
                      {product.unit} • ₹{product.price} each
                    </div>
                    <div className="text-xs font-bold text-emerald-800 mt-1">
                      Total: ₹{product.price * quantity}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  {/* Quantity controls */}
                  <div className="flex items-center glass-pill rounded-xl p-1 border border-emerald-200">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white/80 hover:bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-xs"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="font-bold text-xs text-stone-900 px-3">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= available}
                      className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center shadow-xs"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-2 text-stone-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Summary & Proceed to Checkout */}
        <div className="lg:col-span-4">
          <div className="glass-panel p-6 rounded-3xl border border-white shadow-xl space-y-5">
            <h3 className="font-bold text-base text-stone-900 border-b border-stone-200/60 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-bold text-stone-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Shop Fulfillment:</span>
                <span className="font-semibold text-emerald-700">Choose at Checkout</span>
              </div>
              <div className="text-[11px] text-stone-400 italic">
                * Home delivery charge or free store pickup is selected on the next step.
              </div>
            </div>

            <div className="border-t border-stone-200/60 pt-3 flex justify-between items-baseline">
              <div>
                <div className="text-xs text-stone-400 uppercase font-bold">Estimated Total</div>
                <div className="text-2xl font-black text-emerald-800">₹{subtotal}</div>
              </div>
              <span className="text-[10px] text-stone-500">Excl. delivery fee</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2"
              id="cart-proceed-checkout"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <Link
              to="/products"
              className="block text-center text-xs text-stone-500 hover:text-emerald-700 hover:underline font-semibold"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
