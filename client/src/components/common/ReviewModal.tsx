import React, { useState } from 'react';
import { X, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { RatingStars } from './RatingStars';
import { useAuth } from '../../context/AuthContext';

interface ReviewModalProps {
  orderId: number;
  orderNumber: string;
  shopId: number;
  shopName: string;
  productId?: number;
  productName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  orderId,
  orderNumber,
  shopId,
  shopName,
  productId,
  productName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a short review sharing your experience.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(user?.id),
        },
        body: JSON.stringify({
          customerId: user?.id,
          customerName: user?.name,
          shopId,
          orderId,
          productId: productId || null,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel-elevated w-full max-w-lg rounded-2xl p-6 relative text-stone-800 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100/60 text-stone-500 hover:text-stone-800 transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-amber-100 text-amber-700">
            <Star size={26} className="fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Review Your Purchase</h3>
            <p className="text-xs text-stone-500">Order {orderNumber} • {shopName}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {productName && (
            <div className="p-3 rounded-xl bg-stone-100/60 text-xs text-stone-700">
              Reviewing product: <strong>{productName}</strong>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              Rate your experience
            </label>
            <div className="flex items-center gap-2 p-3 rounded-xl glass-pill w-fit">
              <RatingStars rating={rating} size={24} interactive onSelect={(r) => setRating(r)} />
              <span className="text-sm font-bold text-stone-800 ml-2">
                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : rating === 2 ? 'Below Average' : 'Poor'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              Your Review & Comments
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the product freshness, store service, and pickup/delivery? Share your feedback with the local community..."
              className="glass-input w-full p-3 rounded-xl text-sm"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition shadow-lg shadow-emerald-700/20"
            >
              {isSubmitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
