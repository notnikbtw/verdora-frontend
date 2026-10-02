import React from 'react';
import { cn } from '@/lib/utils';

export type CareItem = {
  title: string;
  text: string;
  icon?: React.ReactNode;
};

export type ProductCareCardsProps = {
  items?: CareItem[];
  className?: string;
};

export const ProductCareCards: React.FC<ProductCareCardsProps> = ({
  items = [],
  className,
}) => {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          'max-w-2xl py-8 text-center text-text-muted animate-in fade-in duration-200',
          className
        )}
      >
        <p className="text-sm font-medium">
          Care instructions are not specified for this product.
        </p>
      </div>
    );
  }
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 animate-in fade-in duration-200',
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={`${item.title}-${idx}`}
          className="bg-[#fcfdfb] border border-border rounded-[16px] p-5 space-y-2.5 shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            {item.icon}
            <h3 className="font-heading font-semibold text-base text-[#0C0C0C]">
              {item.title}
            </h3>
          </div>
          <p className="text-sm text-[#5c665d] leading-relaxed">{item.text}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductCareCards;
