import React from 'react';
import { cn } from '@/lib/utils';

export type ProductAssuranceCardsProps = {
  deliveryTitle?: string;
  deliveryText?: string;
  guaranteeTitle?: string;
  guaranteeText?: string;
  className?: string;
};

export const ProductAssuranceCards: React.FC<ProductAssuranceCardsProps> = ({
  deliveryTitle = 'Delivery',
  deliveryText = 'Calculated at checkout',
  guaranteeTitle = 'Plant guarantee',
  guaranteeText = '14 days after arrival',
  className,
}) => {
  if (!deliveryText && !guaranteeText) return null;

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 mt-auto shrink-0',
        className
      )}
    >
      {deliveryText && (
        <div className="bg-[#fcfdfb] border border-border rounded-[16px] p-3.5 sm:p-4">
          {deliveryTitle && (
            <div className="text-xs text-text-muted mb-1 font-medium">
              {deliveryTitle}
            </div>
          )}
          <div className="text-[15px] font-medium text-[#0C0C0C]">
            {deliveryText}
          </div>
        </div>
      )}

      {guaranteeText && (
        <div className="bg-[#fcfdfb] border border-border rounded-[16px] p-3.5 sm:p-4">
          {guaranteeTitle && (
            <div className="text-xs text-text-muted mb-1 font-medium">
              {guaranteeTitle}
            </div>
          )}
          <div className="text-[15px] font-medium text-[#0C0C0C]">
            {guaranteeText}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAssuranceCards;
