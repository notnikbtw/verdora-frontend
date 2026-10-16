import { useState } from 'react';
import { TableRow, TableCell } from '@components/ui/table';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Package, Pencil, Percent, TagIcon } from 'lucide-react';
import type { Product } from '@/types/product';
import { formatCurrency } from '@/utils/order.utils';
import { getDiscountPercent, hasActiveDiscount } from '@/utils/product.utils';

type DiscountRowProps = {
  product: Product;
  categoryName?: string;
  onSetDiscount: (product: Product) => void;
  onEditDiscount: (product: Product) => void;
  onRemoveDiscount: (product: Product) => void;
};

export const DiscountRow = ({
  product,
  categoryName = 'Uncategorized',
  onSetDiscount,
  onEditDiscount,
  onRemoveDiscount,
}: DiscountRowProps) => {
  const [imageError, setImageError] = useState(false);
  const discounted = hasActiveDiscount(product);

  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="pl-6 font-medium">
        <div className="flex items-center gap-3">
          <div className="relative size-10 rounded-md border border-border bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
            {product.imageUrl && !imageError ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="size-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <Package
                className="size-5 text-muted-foreground/60"
                aria-hidden="true"
              />
            )}
          </div>
          <p
            className="min-w-0 max-w-xs sm:max-w-sm text-sm font-semibold text-foreground truncate"
            title={product.name}
          >
            {product.name}
          </p>
        </div>
      </TableCell>

      <TableCell>
        <Badge
          variant="secondary"
          className="font-normal text-xs bg-muted text-muted-foreground hover:bg-muted"
        >
          {categoryName}
        </Badge>
      </TableCell>

      <TableCell className="text-right font-medium text-foreground">
        {discounted ? (
          <span className="text-xs line-through text-muted-foreground">
            {formatCurrency(product.price)}
          </span>
        ) : (
          formatCurrency(product.price)
        )}
      </TableCell>

      <TableCell className="text-right">
        {discounted ? (
          <div className="flex items-center justify-end gap-1.5">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(product.discountPrice!)}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] px-1 py-0 border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            >
              {getDiscountPercent(product)}% OFF
            </Badge>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell className="pr-6 text-right">
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          {!discounted && (
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
          )}

          {discounted && (
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
          )}

          {discounted && (
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
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default DiscountRow;
