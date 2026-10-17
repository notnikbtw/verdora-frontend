import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { Button } from '@components/ui/button';
import { Loader2, PackageSearch } from 'lucide-react';
import ErrorSection from '@components/common/section/ErrorSection';
import { EmptySection } from '@components/common/section/EmptySection';
import { PaginationComponent } from '@components/common/pagination/Pagination';
import { ProductListSkeleton } from '@components/common/cards/ProductRow';
import { DiscountRow } from '@components/admin/discounts/DiscountRow';
import type { Product } from '@/types/product';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

type DiscountTableProps = {
  products: Product[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error?: AxiosError<ApiErrorResponse> | null;
  page: number;
  totalPages: number;
  totalElements: number;
  hasActiveFilters: boolean;
  hasSearch: boolean;
  discountedOnly: boolean;
  categoryIdToNameMap: Map<number, string>;
  onPageChange: (page: number) => void;
  onRefetch: () => void;
  onClearAllFilters: () => void;
  onShowAll: () => void;
  onSetDiscount: (product: Product) => void;
  onEditDiscount: (product: Product) => void;
  onRemoveDiscount: (product: Product) => void;
};

const TableHeaders = () => (
  <TableHeader>
    <TableRow>
      <TableHead className="pl-6">Product</TableHead>
      <TableHead>Category</TableHead>
      <TableHead className="text-right">Price</TableHead>
      <TableHead className="text-right">Discount Price</TableHead>
      <TableHead className="pr-6 text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
);

export const DiscountTable: React.FC<DiscountTableProps> = ({
  products,
  isLoading,
  isFetching,
  isError,
  error,
  page,
  totalPages,
  totalElements,
  hasActiveFilters,
  hasSearch,
  discountedOnly,
  categoryIdToNameMap,
  onPageChange,
  onRefetch,
  onClearAllFilters,
  onShowAll,
  onSetDiscount,
  onEditDiscount,
  onRemoveDiscount,
}) => {
  const emptyTitle = hasSearch
    ? 'No results found'
    : discountedOnly
      ? 'No discounted products'
      : 'No products';
  const emptyDescription = hasSearch
    ? 'No products match the current search.'
    : discountedOnly
      ? 'No products currently have a discount. Switch to "All products" to set one.'
      : 'There are no products in your store catalog yet.';

  return (
    <div className="mt-6 relative">
      {isFetching && !isLoading && (
        <div className="absolute top-3 right-4 z-10 flex items-center gap-2 rounded-full bg-background/95 backdrop-blur-xs border border-border px-3 py-1 text-xs font-medium shadow-sm text-primary">
          <Loader2 className="size-3.5 animate-spin" />
          <span>Updating list...</span>
        </div>
      )}

      {isLoading ? (
        <Card className="border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeaders />
            <TableBody>
              <ProductListSkeleton count={12} />
            </TableBody>
          </Table>
        </Card>
      ) : isError ? (
        <Card className="border-border py-8 shadow-sm">
          <ErrorSection
            title="Failed to load products"
            message={error?.response?.data?.message}
            onRetry={onRefetch}
            retryText="Try again"
          />
        </Card>
      ) : products.length === 0 ? (
        <Card className="border-border py-12 shadow-sm">
          <EmptySection
            title={emptyTitle}
            description={emptyDescription}
            className="px-6"
            icon={
              <div className="flex items-center justify-center rounded-full bg-muted p-4">
                <PackageSearch
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            }
            action={
              hasActiveFilters ? (
                <Button
                  variant="outline"
                  onClick={onClearAllFilters}
                  className="cursor-pointer"
                >
                  Clear all filters
                </Button>
              ) : discountedOnly ? (
                <Button
                  variant="outline"
                  onClick={onShowAll}
                  className="cursor-pointer"
                >
                  Show all products
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <Card
          className={`border-border shadow-sm transition-opacity ${
            isFetching ? 'opacity-70' : 'opacity-100'
          }`}
        >
          <CardHeader className="py-4 px-6 border-b">
            <CardTitle className="text-base">Product Prices</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Displaying page {page + 1} of {totalPages} ({products.length} of{' '}
              {totalElements} items)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeaders />
              <TableBody>
                {products.map(product => (
                  <DiscountRow
                    key={product.productId}
                    product={product}
                    categoryName={
                      categoryIdToNameMap.get(product.categoryId) ||
                      `Category ${product.categoryId}`
                    }
                    onSetDiscount={onSetDiscount}
                    onEditDiscount={onEditDiscount}
                    onRemoveDiscount={onRemoveDiscount}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>

          {totalPages > 1 && (
            <div className="p-4 border-t border-border">
              <PaginationComponent
                currentPage={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default DiscountTable;
