import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: number;
  interactive?: boolean;
  onSelect?: (r: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  count,
  size = 14,
  interactive = false,
  onSelect,
}) => {
  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-stone-200 text-stone-300'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && onSelect && onSelect(star)}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-stone-700 ml-1">
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-xs text-stone-400">({count})</span>
      )}
    </div>
  );
};
