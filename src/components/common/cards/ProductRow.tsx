import { useState, type ReactNode } from 'react';
import { TableRow, TableCell } from '@components/ui/table';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Eye, Pencil, Trash2, Package } from 'lucide-react';
import type { Product } from '@/types/product';
import { Skeleton } from '@components/ui/skeleton';
import { formatCurrency } from '@/utils/order.utils';
import {
  getDiscountPercent,
  hasDiscountPrice,
  hasValidDiscount,
} from '@/utils/product.utils';

type ProductRowProps = {
  product: Product;
  categoryName?: string;
  onViewDetails?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  // Replaces the default view/edit/delete buttons when provided.
  actions?: ReactNode;
};

export const ProductRow = ({
  product,
  categoryName = 'Uncategorized',
  onViewDetails,
  onEdit,
  onDelete,
  actions,
}: ProductRowProps) => {
  const [imageError, setImageError] = useState(false);

  const discounted = hasValidDiscount(product);
  const invalidDiscount = hasDiscountPrice(product) && !discounted;

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
          <div className="min-w-0 max-w-xs sm:max-w-sm">
            <p
              className="text-sm font-semibold text-foreground truncate"
              title={product.name}
            >
              {product.name}
            </p>
            {product.description && (
              <p
                className="text-xs text-muted-foreground truncate"
                title={product.description}
              >
                {product.description}
              </p>
            )}
          </div>
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
        ) : invalidDiscount ? (
          <div className="flex items-center justify-end gap-1.5">
            <span className="font-semibold text-muted-foreground">
              {formatCurrency(product.discountPrice)}
            </span>
            <Badge
              variant="destructive"
              className="text-[10px] px-1 py-0"
              title="The discount price must be lower than the regular price"
            >
              Invalid
            </Badge>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell className="pr-6 text-right">
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          {actions ?? (
            <>
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(product)}
                  className="cursor-pointer h-8 px-2 text-xs"
                  title="View product details"
                  aria-label={`View details of ${product.name}`}
                >
                  <Eye className="size-3.5 mr-1" />
                  <span className="hidden sm:inline">Details</span>
                </Button>
              )}

              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(product)}
                  className="cursor-pointer h-8 px-2 text-xs"
                  title="Edit product"
                  aria-label={`Edit ${product.name}`}
                >
                  <Pencil className="size-3.5 mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(product)}
                  className="cursor-pointer h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                  title="Delete product"
                  aria-label={`Delete ${product.name}`}
                >
                  <Trash2 className="size-3.5 mr-1" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              )}
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export const ProductRowSkeleton = () => {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell className="pl-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-md shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-28 rounded-full" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-4 w-16 ml-auto" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-4 w-20 ml-auto" />
      </TableCell>
      <TableCell className="pr-6 text-right">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </TableCell>
    </TableRow>
  );
};

export const ProductListSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ProductRowSkeleton key={index} />
      ))}
    </>
  );
};

export default { ProductRow, ProductRowSkeleton };
