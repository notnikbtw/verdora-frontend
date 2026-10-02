import React from 'react';
import { cn } from '@/lib/utils';

export type ReviewItem = {
  initials: string;
  name: string;
  rating: number;
  text: string;
  date?: string;
};

export type ProductReviewsListProps = {
  reviews?: ReviewItem[];
  className?: string;
};

export const ProductReviewsList: React.FC<ProductReviewsListProps> = ({
  reviews = [],
  className,
}) => {
  if (reviews.length === 0) {
    return (
      <div
        className={cn(
          'max-w-2xl py-8 text-center text-text-muted animate-in fade-in duration-200',
          className
        )}
      >
        <p className="text-sm font-medium">No reviews yet for this product.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'max-w-2xl space-y-4 animate-in fade-in duration-200',
        className
      )}
    >
      {reviews.map((rev, idx) => (
        <div
          key={`${rev.name}-${idx}`}
          className="bg-[#fcfdfb] border border-border rounded-[16px] p-5 space-y-2.5 shadow-xs"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="size-8.5 rounded-full bg-[#E5EFE2] text-[#0C0C0C] font-bold text-xs flex items-center justify-center shrink-0">
                {rev.initials}
              </span>
              <div>
                <span className="font-heading font-semibold text-sm text-[#0C0C0C]">
                  {rev.name}
                </span>
                <div className="text-xs text-[#3E8D35] tracking-widest leading-none mt-0.5">
                  {'★'.repeat(rev.rating)}
                </div>
              </div>
            </div>

            {rev.date && (
              <span className="text-xs text-[#8a948c] font-medium shrink-0">
                {rev.date}
              </span>
            )}
          </div>
          <p className="text-sm text-[#5c665d] leading-relaxed">{rev.text}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductReviewsList;
