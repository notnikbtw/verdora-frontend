import { useState, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router';
import { useDebounce } from 'use-debounce';
import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import Breadcrumbs from '@components/common/Breadcrumbs';
import { SectionHeader } from '@components/common/section/AdminSectionHeader';
import { PaginationComponent } from '@components/common/pagination/Pagination';
import CatalogFilterSidebar from '@components/catalog/CatalogFilterSidebar';
import CatalogToolbar, {
  type ViewMode,
} from '@components/catalog/CatalogToolbar';
import CatalogProductList from '@components/catalog/CatalogProductList';
import { useGetProducts } from '@api/product/product.hooks';
import { useAllCategories } from '@api/category/category.hooks';
import { useAddItemToCart } from '@api/cart/cart.hooks';
import {
  useFavoriteProductIds,
  useAddToFavorites,
  useRemoveFromFavorites,
} from '@api/favorites/favorites.hooks';
import LoginPromptDialog from '@components/common/dialog/LoginPromptDialog';
import { X } from 'lucide-react';
import type { GetProductsPayload } from '@/types/product';

const PAGE_SIZE = 12;
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 9000;

const mapSortToParam = (sortId: string): string | undefined => {
  switch (sortId) {
    case 'price-asc':
      return 'price,asc';
    case 'price-desc':
      return 'price,desc';
    case 'date':
      return 'createdAt,desc';
    case 'az':
      return 'name,asc';
    case 'za':
      return 'name,desc';
    case 'rating':
    default:
      return undefined;
  }
};

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const isSalesPath = location.pathname.includes('/sales');

  const categoryParam =
    searchParams.get('category') || searchParams.get('categoryId');
  const parsedId = Number(categoryParam);
  const selectedCategoryId =
    Number.isInteger(parsedId) && parsedId > 0 ? parsedId : undefined;

  const searchQuery = searchParams.get('search')?.trim() || '';

  const onSaleOnly =
    isSalesPath ||
    searchParams.get('discount') === 'true' ||
    searchParams.get('onSale') === 'true';

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    DEFAULT_MIN_PRICE,
    DEFAULT_MAX_PRICE,
  ]);
  const [debouncedPriceRange] = useDebounce(priceRange, 400);
  const [selectedSort, setSelectedSort] = useState<string>('rating');
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useAllCategories();

  const { favoriteIdsSet } = useFavoriteProductIds();
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();

  const handleToggleFavorite = (targetProductId: number) => {
    if (favoriteIdsSet.has(targetProductId)) {
      removeFromFavoritesMutation.mutate(targetProductId);
    } else {
      addToFavoritesMutation.mutate(targetProductId);
    }
  };

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach(cat => {
      map.set(Number(cat.categoryId), cat.name);
    });
    return map;
  }, [categories]);

  const queryParams = useMemo<GetProductsPayload>(() => {
    const params: GetProductsPayload = {
      page: currentPage,
      size: PAGE_SIZE,
    };

    if (selectedCategoryId !== undefined)
      params.categoryId = selectedCategoryId;
    if (debouncedPriceRange[0] > DEFAULT_MIN_PRICE)
      params.minPrice = debouncedPriceRange[0];
    if (debouncedPriceRange[1] < DEFAULT_MAX_PRICE)
      params.maxPrice = debouncedPriceRange[1];
    if (onSaleOnly) params.discount = true;
    if (searchQuery) params.search = searchQuery;

    const sortParam = mapSortToParam(selectedSort);
    if (sortParam) params.sort = sortParam;

    return params;
  }, [
    currentPage,
    selectedCategoryId,
    debouncedPriceRange,
    onSaleOnly,
    searchQuery,
    selectedSort,
  ]);

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useGetProducts(queryParams);

  const addItemMutation = useAddItemToCart();
  const handleAddToCart = (productId: number) => {
    const product = productsData?.content.find(p => p.productId === productId);
    addItemMutation.mutate({ productId, quantity: 1, product });
  };

  const updateParam = (key: string, value: string | null) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value === null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    });
    setCurrentPage(0);
  };

  const handleSelectCategory = (id?: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('categoryId');
      if (id !== undefined) {
        next.set('category', String(id));
      } else {
        next.delete('category');
      }
      return next;
    });
    setCurrentPage(0);
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
    setCurrentPage(0);
  };

  const handleToggleOnSaleOnly = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (onSaleOnly) {
        next.delete('discount');
        next.delete('onSale');
      } else {
        next.set('discount', 'true');
      }
      return next;
    });
    setCurrentPage(0);
  };

  const handleSortChange = (sortId: string) => {
    setSelectedSort(sortId);
    setCurrentPage(0);
  };

  const handleResetAll = () => {
    setPriceRange([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);
    setSelectedSort('rating');
    setCurrentPage(0);
    setSearchParams({});
  };

  const handleClearSearch = () => {
    updateParam('search', null);
  };

  const hasActiveFilters = Boolean(
    selectedCategoryId !== undefined ||
    onSaleOnly ||
    priceRange[0] > DEFAULT_MIN_PRICE ||
    priceRange[1] < DEFAULT_MAX_PRICE ||
    searchQuery.length > 0
  );

  const products = productsData?.content || [];
  const totalPages = productsData?.totalPages || 0;
  const totalElements = productsData?.totalElements || 0;

  const selectedCategoryName = selectedCategoryId
    ? categoryMap.get(selectedCategoryId)
    : undefined;

  const pageTitle = selectedCategoryName
    ? selectedCategoryName.charAt(0).toUpperCase() +
      selectedCategoryName.slice(1)
    : onSaleOnly
      ? 'Discounted & Sale Items'
      : 'All plants & garden care';

  const pageDescription = isLoadingProducts
    ? 'Finding the freshest plants for you...'
    : isProductsError
      ? 'Unable to load products from server.'
      : totalElements === 0
        ? 'No products match your selection.'
        : `${totalElements} ${totalElements === 1 ? 'product' : 'products'} match your selection`;

  const fromIndex = totalElements === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const toIndex = Math.min((currentPage + 1) * PAGE_SIZE, totalElements);
  const showingText =
    totalElements === 0
      ? '0 products'
      : `Showing ${fromIndex}-${toIndex} of ${totalElements} products`;

  return (
    <LayoutPage>
      <div className="flex justify-center items-center">
        <div className="py-6 space-y-6 max-w-300">
          <Breadcrumbs />

          <SectionHeader
            title={pageTitle}
            count={isLoadingProducts ? undefined : totalElements}
            countLabel="products"
            description={pageDescription}
          />

          <div className="flex justify-center flex-col lg:flex-row items-start gap-7 pt-2">
            <CatalogFilterSidebar
              categories={categories}
              isLoadingCategories={isLoadingCategories}
              isCategoriesError={isCategoriesError}
              onRetryCategories={() => refetchCategories()}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={handleSelectCategory}
              priceRange={priceRange}
              onPriceRangeChange={handlePriceRangeChange}
              onSaleOnly={onSaleOnly}
              onToggleOnSaleOnly={handleToggleOnSaleOnly}
              onResetAll={handleResetAll}
            />

            <div className="flex-1 min-w-0 w-full flex flex-col gap-6">
              <CatalogToolbar
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                selectedSort={selectedSort}
                onSortChange={handleSortChange}
              />

              {searchQuery && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-sm">
                  <span className="text-text-muted">Search results for:</span>
                  <span className="font-semibold text-text-h">
                    &ldquo;{searchQuery}&rdquo;
                  </span>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="ml-auto flex items-center gap-1 text-xs text-text-muted hover:text-text cursor-pointer transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="size-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              )}

              <CatalogProductList
                products={products}
                isLoading={isLoadingProducts}
                isError={isProductsError}
                onRetry={() => refetchProducts()}
                categoryMap={categoryMap}
                viewMode={viewMode}
                onAddToCart={handleAddToCart}
                onAuthRequired={() => setIsLoginPromptOpen(true)}
                onResetAll={handleResetAll}
                searchQuery={searchQuery}
                hasActiveFilters={hasActiveFilters}
                isFavorite={id => favoriteIdsSet.has(id)}
                onToggleFavorite={handleToggleFavorite}
              />

              {!isLoadingProducts && totalElements > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border gap-4">
                  <span className="text-xs sm:text-sm text-text">
                    {showingText}
                  </span>
                  {totalPages > 1 && (
                    <PaginationComponent
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={page => setCurrentPage(page)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <LoginPromptDialog
          open={isLoginPromptOpen}
          onOpenChange={setIsLoginPromptOpen}
          action="favorite"
        />
      </div>
    </LayoutPage>
  );
};

export default Catalog;
