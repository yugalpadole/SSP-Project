import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, ShoppingBag, Store, Layers } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  showShopName?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showShopName = true,
}) => {
  const { items, addToCart, updateQuantity } = useCart();

  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const available = product.available_stock !== undefined ? product.available_stock : product.stock_quantity;
  const isOutOfStock = available <= 0;
  const isLowStock = available > 0 && available <= 5;

  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  return (
    <div className="glass-panel glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between group border border-white/80 transition-all duration-300">
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-4/3 overflow-hidden bg-stone-100/50">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Discount Badge */}
          {discountPercent && discountPercent > 0 && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500 text-white shadow-sm">
              {discountPercent}% OFF
            </span>
          )}

          {/* Stock Badges */}
          {isOutOfStock ? (
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-600 text-white shadow-sm">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-orange-500 text-white shadow-sm animate-pulse">
              Only {available} left!
            </span>
          ) : null}

          {/* Compare Prices Quick Indicator */}
          <Link
            to={`/products/${product.id}`}
            className="absolute bottom-2 right-2 p-1.5 rounded-xl glass-panel-elevated text-stone-700 hover:text-emerald-700 transition opacity-0 group-hover:opacity-100 shadow-md text-[10px] font-bold flex items-center gap-1"
            title="Compare shop prices"
          >
            <Layers size={13} className="text-emerald-600" />
            <span>Compare</span>
          </Link>
        </div>

        {/* Content Info */}
        <div className="p-4">
          {/* Shop Link */}
          {showShopName && product.shop_name && (
            <Link
              to={`/shops/${product.shop_id}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:underline mb-1"
            >
              <Store size={12} className="text-emerald-600" />
              <span className="truncate max-w-[170px]">{product.shop_name}</span>
            </Link>
          )}

          {/* Title */}
          <Link to={`/products/${product.id}`}>
            <h3 className="font-bold text-sm text-stone-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>

          {/* Unit / Weight */}
          <div className="text-xs text-stone-400 mt-1">
            {product.unit || '1 unit'}
          </div>

          {/* Price and MRP */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-base font-extrabold text-stone-900">
              ₹{product.price}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-xs text-stone-400 line-through">
                ₹{product.mrp}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 pt-0">
        {isOutOfStock ? (
          <button
            disabled
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-stone-200/70 text-stone-400 cursor-not-allowed"
          >
            Out of Stock
          </button>
        ) : quantity > 0 ? (
          <div className="flex items-center justify-between glass-pill p-1 rounded-xl border border-emerald-300">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="w-7 h-7 rounded-lg bg-white/80 hover:bg-emerald-50 text-emerald-800 flex items-center justify-center transition shadow-xs"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="text-xs font-bold text-stone-900 px-2">{quantity}</span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              disabled={quantity >= available}
              className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition shadow-xs"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(product, 1)}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-300/80 transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>Add to Cart</span>
          </button>
        )}
      </div>
    </div>
  );
};
