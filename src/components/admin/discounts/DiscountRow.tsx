import { Button } from '@components/ui/button';
import { ProductRow } from '@components/common/cards/ProductRow';
import { Pencil, Percent, TagIcon } from 'lucide-react';
import type { Product } from '@/types/product';
import { hasDiscountPrice } from '@/utils/product.utils';

type DiscountRowProps = {
  product: Product;
  categoryName?: string;
  onSetDiscount: (product: Product) => void;
  onEditDiscount: (product: Product) => void;
  onRemoveDiscount: (product: Product) => void;
};

// Any stored discount can be edited or removed, including invalid ones that
// are not shown as a discount in the price columns.
export const DiscountRow = ({
  product,
  categoryName,
  onSetDiscount,
  onEditDiscount,
  onRemoveDiscount,
}: DiscountRowProps) => {
  const hasDiscount = hasDiscountPrice(product);

  return (
    <ProductRow
      product={product}
      categoryName={categoryName}
      actions={
        hasDiscount ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditDiscount(product)}
              className="cursor-pointer h-8 px-2 text-xs"
              title="Edit discount"
              aria-label={`Edit discount of ${product.name}`}
            >
              <Pencil className="size-3.5 mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveDiscount(product)}
              className="cursor-pointer h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
              title="Remove discount"
              aria-label={`Remove discount from ${product.name}`}
            >
              <TagIcon className="size-3.5 mr-1" />
              <span className="hidden sm:inline">Remove discount</span>
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDiscount(product)}
            className="cursor-pointer h-8 px-2 text-xs"
            title="Set discount"
            aria-label={`Set discount for ${product.name}`}
          >
            <Percent className="size-3.5 mr-1" />
            <span className="hidden sm:inline">Set discount</span>
          </Button>
        )
      }
    />
  );
};

export default DiscountRow;
