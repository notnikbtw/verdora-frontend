import React from 'react';
import { cn } from '@/lib/utils';

export type SpecItem = {
  label: string;
  value: string;
};

export type ProductSpecsTableProps = {
  specs: SpecItem[];
  className?: string;
};

export const ProductSpecsTable: React.FC<ProductSpecsTableProps> = ({
  specs,
  className,
}) => {
  return (
    <div className={cn('divide-y divide-border', className)}>
      {specs.map((item, idx) => (
        <div
          key={`${item.label}-${idx}`}
          className="py-3 flex items-baseline gap-4 first:pt-0"
        >
          <span className="w-36 sm:w-44 text-sm text-text-muted shrink-0">
            {item.label}
          </span>
          <span className="text-[15px] font-medium text-[#0C0C0C]">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ProductSpecsTable;
