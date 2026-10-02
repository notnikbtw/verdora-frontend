import React, { useState, useMemo } from 'react';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { ProductSpecsTable, type SpecItem } from './tabs/ProductSpecsTable';
import { ProductCareCards, type CareItem } from './tabs/ProductCareCards';
import { ProductReviewsList, type ReviewItem } from './tabs/ProductReviewsList';

export type { SpecItem, CareItem, ReviewItem };

export type ProductTabsProps = {
  product: Product;
  categoryName?: string;
  specs?: SpecItem[];
  careItems?: CareItem[];
  reviews?: ReviewItem[];
  className?: string;
};

export const ProductTabs: React.FC<ProductTabsProps> = ({
  product,
  categoryName,
  specs,
  careItems,
  reviews,
  className,
}) => {
  const hasCare = Boolean(careItems && careItems.length > 0);
  const hasReviews = Boolean(reviews && reviews.length > 0);

  const [activeTab, setActiveTab] = useState<
    'description' | 'care' | 'reviews'
  >('description');

  const currentTab =
    (!hasCare && activeTab === 'care') ||
    (!hasReviews && activeTab === 'reviews')
      ? 'description'
      : activeTab;

  const resolvedSpecs: SpecItem[] = useMemo(() => {
    if (specs && specs.length > 0) return specs;
    const items: SpecItem[] = [];
    if (categoryName) {
      items.push({ label: 'Category', value: categoryName });
    }
    items.push({ label: 'Product SKU', value: `VD-${product.productId}` });
    return items;
  }, [specs, categoryName, product.productId]);

  return (
    <div className={className}>
      <div className="flex items-center gap-1 sm:gap-2 border-b border-border overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('description')}
          className={cn(
            'px-4 sm:px-6 py-3.5 text-[15px] font-semibold tracking-tight transition-all border-b-2 cursor-pointer whitespace-nowrap',
            currentTab === 'description'
              ? 'text-[#0C0C0C] border-[#3E8D35]'
              : 'text-[#586455] border-transparent hover:text-[#0C0C0C]'
          )}
        >
          Description
        </button>

        {hasCare && (
          <button
            type="button"
            onClick={() => setActiveTab('care')}
            className={cn(
              'px-4 sm:px-6 py-3.5 text-[15px] font-semibold tracking-tight transition-all border-b-2 cursor-pointer whitespace-nowrap',
              currentTab === 'care'
                ? 'text-[#0C0C0C] border-[#3E8D35]'
                : 'text-[#586455] border-transparent hover:text-[#0C0C0C]'
            )}
          >
            Care & shipping
          </button>
        )}

        {hasReviews && (
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={cn(
              'px-4 sm:px-6 py-3.5 text-[15px] font-semibold tracking-tight transition-all border-b-2 cursor-pointer whitespace-nowrap',
              currentTab === 'reviews'
                ? 'text-[#0C0C0C] border-[#3E8D35]'
                : 'text-[#586455] border-transparent hover:text-[#0C0C0C]'
            )}
          >
            Reviews ({reviews?.length ?? 0})
          </button>
        )}
      </div>

      <div className="pt-6 sm:pt-8">
        {currentTab === 'description' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start animate-in fade-in duration-200">
            <div className="space-y-4 text-[15px] sm:text-base text-[#5c665d] leading-[1.7]">
              <p>
                {product.description ||
                  'No detailed description available for this product.'}
              </p>
            </div>

            <ProductSpecsTable specs={resolvedSpecs} />
          </div>
        )}

        {currentTab === 'care' && hasCare && (
          <ProductCareCards items={careItems} />
        )}

        {currentTab === 'reviews' && hasReviews && (
          <ProductReviewsList reviews={reviews} />
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
