import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Truck, Clock, MessageSquare, ArrowRight, Store } from 'lucide-react';
import { Shop } from '../../types';
import { RatingStars } from '../common/RatingStars';

interface ShopCardProps {
  shop: Shop;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const isDelivery = Boolean(shop.is_delivery_enabled);

  // WhatsApp quick greeting
  const whatsappUrl = `https://wa.me/${shop.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello! I discovered ${shop.name} on E-Bazaar and would like to ask about available products.`
  )}`;

  return (
    <div className="glass-panel glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between group border border-white/80 transition-all duration-300">
      <div>
        {/* Banner with Logo Overlay */}
        <div className="relative h-32 overflow-hidden bg-stone-100">
          <img
            src={shop.banner_url || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80'}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Category Pill */}
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 backdrop-blur-xs text-stone-800 shadow-sm">
            {shop.category}
          </span>

          {/* WhatsApp Direct Action */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition transform hover:scale-110 flex items-center gap-1 text-[11px] font-bold"
            title="Chat with shopkeeper on WhatsApp"
          >
            <MessageSquare size={13} />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* Shop Logo Overlap */}
          <div className="absolute -bottom-4 left-4">
            <img
              src={shop.logo_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'}
              alt={shop.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md bg-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="pt-6 px-4 pb-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link to={`/shops/${shop.id}`}>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-emerald-700 transition leading-snug line-clamp-1">
                {shop.name}
              </h3>
            </Link>
          </div>

          <div className="mb-2">
            <RatingStars rating={shop.rating || 4.8} count={shop.review_count || 12} size={13} />
          </div>

          <p className="text-xs text-stone-500 line-clamp-2 mb-3">
            {shop.description}
          </p>

          <div className="flex items-center gap-1 text-xs text-stone-500 mb-3">
            <MapPin size={13} className="text-emerald-600 shrink-0" />
            <span className="truncate">{shop.locality}, Pune</span>
          </div>

          {/* Services Badges */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {isDelivery ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1">
                <Truck size={11} className="text-emerald-600" />
                <span>Home Delivery (₹{shop.delivery_charge || 25})</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                Delivery Unavailable
              </span>
            )}

            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1">
              <Clock size={11} className="text-amber-600" />
              <span>Reserve & Pickup</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="p-4 pt-0">
        <Link
          to={`/shops/${shop.id}`}
          className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Store size={14} />
          <span>Visit Storefront</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
