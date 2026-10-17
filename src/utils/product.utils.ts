import type { Product } from '@/types/product';

// A discount is stored as a positive discountPrice.
export const hasDiscountPrice = (product: Product): boolean =>
  typeof product.discountPrice === 'number' && product.discountPrice > 0;

// A stored discount only applies when it is lower than the regular price.
export const hasValidDiscount = (product: Product): boolean =>
  hasDiscountPrice(product) && product.discountPrice! < product.price;

export const getDiscountPercent = (product: Product): number =>
  hasValidDiscount(product)
    ? Math.round(
        ((product.price - product.discountPrice!) / product.price) * 100
      )
    : 0;
