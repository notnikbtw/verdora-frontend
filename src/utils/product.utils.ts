import type { Product } from '@/types/product';

export const hasActiveDiscount = (product: Product): boolean =>
  typeof product.discountPrice === 'number' &&
  product.discountPrice > 0 &&
  product.discountPrice < product.price;

export const getDiscountPercent = (product: Product): number =>
  hasActiveDiscount(product)
    ? Math.round(
        ((product.price - product.discountPrice!) / product.price) * 100
      )
    : 0;
