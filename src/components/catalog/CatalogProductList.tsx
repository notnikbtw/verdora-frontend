import { Flower2, RotateCcw, AlertCircle, SearchX } from 'lucide-react';
import type { ViewMode } from '@components/catalog/CatalogToolbar';
import CatalogProductCard from '@components/catalog/CatalogProductCard';
import type { Product } from '@/types/product';
import CatalogProductCardSkeleton from '@components/catalog/CatalogProductCardSkeleton';

type Props = {
  products?: Product[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  categoryMap?: Map<number, string>;
  viewMode: ViewMode;
  isFavorite?: (id: number) => boolean;
  isFavoritePending?: (id: number) => boolean;
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
  isFavoritePending,
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
    return <CatalogProductCardSkeleton viewMode={viewMode} />;
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
          isFavoritePending={
            isFavoritePending ? isFavoritePending(product.productId) : false
          }
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
