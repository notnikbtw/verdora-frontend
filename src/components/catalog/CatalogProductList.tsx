import { Card } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import { Flower2, RotateCcw, AlertCircle, SearchX } from 'lucide-react';
import type { ViewMode } from './CatalogToolbar';
import CatalogProductCard from './CatalogProductCard';
import type { Product } from '@/types/product';

type Props = {
  products?: Product[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  categoryMap?: Map<number, string>;
  viewMode: ViewMode;
  isFavorite?: (id: number) => boolean;
  onToggleFavorite?: (id: number) => void;
  onAddToCart?: (id: number) => void;
  onAuthRequired?: () => void;
  onResetAll?: () => void;
  searchQuery?: string;
  hasActiveFilters?: boolean;
  onProductClick?: (productId: number) => void;
};

const CatalogProductList = ({
  products = [],
  isLoading = false,
  isError = false,
  onRetry,
  categoryMap,
  viewMode,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onAuthRequired,
  onResetAll,
  searchQuery,
  hasActiveFilters = false,
  onProductClick,
}: Props) => {
  const isGrid = viewMode === 'grid';

  if (isLoading) {
    return (
      <div
        className={
          isGrid
            ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
            : 'flex flex-col gap-4'
        }
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className={`border border-border bg-[#fcfdfb] rounded-[22px] overflow-hidden p-4 shadow-xs ${
              isGrid
                ? 'flex flex-col gap-3.5'
                : 'flex flex-col sm:flex-row items-center gap-5'
            }`}
          >
            <div
              className={`flex items-start justify-between gap-3 w-full ${
                !isGrid ? 'order-2 flex-1' : ''
              }`}
            >
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-3/4" />
                {!isGrid && <Skeleton className="h-4 w-full mt-2" />}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Skeleton className="size-9 rounded-full" />
                <Skeleton className="size-9 rounded-full" />
              </div>
            </div>
            <div
              className={`relative w-full rounded-[14px] overflow-hidden ${
                isGrid
                  ? 'h-52 sm:h-56'
                  : 'h-48 sm:w-64 sm:h-44 order-1 shrink-0'
              }`}
            >
              <Skeleton className="w-full h-full rounded-none" />
              <Skeleton className="absolute left-3.5 bottom-3.5 h-6 w-16 rounded-[7px]" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-border/70 rounded-[22px] bg-[#fcfdfb] shadow-xs">
        <div className="flex size-12 items-center justify-center rounded-full bg-red-100/80 text-red-600 mb-3">
          <AlertCircle className="size-6 stroke-[1.8]" />
        </div>
        <p className="text-text-h font-heading font-semibold text-lg mb-1">
          Unable to load products
        </p>
        <p className="text-sm text-text-muted mb-5 max-w-sm">
          We encountered an issue connecting to the product server. Please
          verify your connection and try again.
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 cursor-pointer transition-colors shadow-xs"
          >
            <RotateCcw className="size-4" />
            <span>Try again</span>
          </button>
        )}
      </div>
    );
  }

  if (products.length === 0) {
    const isSearching = Boolean(searchQuery && searchQuery.trim().length > 0);

    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-border/70 rounded-[22px] bg-[#fcfdfb] shadow-xs">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted/60 text-text-muted mb-3.5">
          {isSearching ? (
            <SearchX className="size-7 stroke-[1.5]" />
          ) : (
            <Flower2 className="size-7 stroke-[1.5]" />
          )}
        </div>
        <h3 className="font-heading font-semibold text-lg text-text-h mb-1.5">
          {isSearching
            ? `No results for "${searchQuery}"`
            : hasActiveFilters
              ? 'No products match your filters'
              : 'No products found'}
        </h3>
        <p className="text-sm text-text-muted mb-5 max-w-sm">
          {isSearching
            ? 'Please check your spelling or try searching with more general keywords.'
            : hasActiveFilters
              ? 'Try widening your price range, selecting another category, or clearing active filters.'
              : 'There are currently no products available in this section. Please check back later.'}
        </p>
        {onResetAll && (hasActiveFilters || isSearching) && (
          <button
            type="button"
            onClick={onResetAll}
            className="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/80 cursor-pointer transition-colors shadow-xs"
          >
            Reset all filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={
        isGrid
          ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
          : 'flex flex-col gap-4'
      }
    >
      {products.map(product => (
        <CatalogProductCard
          key={product.productId}
          product={product}
          categoryName={categoryMap?.get(product.categoryId)}
          viewMode={viewMode}
          isFavorite={isFavorite ? isFavorite(product.productId) : false}
          onToggleFavorite={onToggleFavorite}
          onAddToCart={onAddToCart}
          onAuthRequired={onAuthRequired}
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
};

export default CatalogProductList;
