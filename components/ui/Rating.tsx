import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function Rating({ rating, maxRating = 5, size = 'md', showValue = false, className }: RatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, index) => {
          if (index < fullStars) {
            return (
              <Star
                key={index}
                className={cn('fill-yellow-400 text-yellow-400', {
                  'w-3 h-3': size === 'sm',
                  'w-4 h-4': size === 'md',
                  'w-5 h-5': size === 'lg',
                })}
              />
            );
          } else if (index === fullStars && hasHalfStar) {
            return (
              <Star
                key={index}
                className={cn('fill-yellow-400/50 text-yellow-400', {
                  'w-3 h-3': size === 'sm',
                  'w-4 h-4': size === 'md',
                  'w-5 h-5': size === 'lg',
                })}
              />
            );
          } else {
            return (
              <Star
                key={index}
                className={cn('text-gray-300', {
                  'w-3 h-3': size === 'sm',
                  'w-4 h-4': size === 'md',
                  'w-5 h-5': size === 'lg',
                })}
              />
            );
          }
        })}
      </div>
      {showValue && (
        <span className={cn('ml-1 text-gray-700', {
          'text-xs': size === 'sm',
          'text-sm': size === 'md',
          'text-base': size === 'lg',
        })}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

