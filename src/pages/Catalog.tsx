import { formatCurrency } from '@/utils/order.utils';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router';
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
import {
  usePaginatedCategories,
  useCategoriesByIds,
} from '@api/category/category.hooks';
import { useToggleFavorite } from '@hooks/useToggleFavorite';
import { useAddProductToCart } from '@hooks/useAddProductToCart';
import { useCatalogScrollRestoration } from '@hooks/useCatalogScrollRestoration';
import LoginPromptDialog from '@components/common/dialog/LoginPromptDialog';
import { X } from 'lucide-react';
import type { GetProductsPayload } from '@/types/product';
import {
  DEFAULT_MAX_PRICE,
  DEFAULT_MIN_PRICE,
  PAGE_SIZE,
} from '@/config/catalog.config';

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

const readPriceParam = (
  params: URLSearchParams,
  key: string,
  fallback: number
): number => {
  const raw = params.get(key);
  if (raw === null) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
};

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
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

  const { data: highestPricedProducts } = useGetProducts({
    categoryId: selectedCategoryId,
    search: searchQuery || undefined,
    discount: onSaleOnly || undefined,
    page: 0,
    size: 1,
    sort: 'price,desc',
  });
  const highestPricedProduct = highestPricedProducts?.content[0];
  const maximumPrice = highestPricedProduct
    ? highestPricedProduct.price
    : highestPricedProducts
      ? 0
      : DEFAULT_MAX_PRICE;

  const viewMode: ViewMode =
    searchParams.get('view') === 'list' ? 'list' : 'grid';
  const pageParam = Number(searchParams.get('page') ?? 1);
  const currentPage =
    Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam - 1 : 0;
  const minPriceParam = readPriceParam(
    searchParams,
    'minPrice',
    DEFAULT_MIN_PRICE
  );
  const maxPriceParam = readPriceParam(searchParams, 'maxPrice', maximumPrice);
  const priceRange = useMemo<[number, number]>(
    () => [minPriceParam, maxPriceParam],
    [minPriceParam, maxPriceParam]
  );
  const [debouncedPriceRange] = useDebounce(priceRange, 400);
  const sortParamFromUrl = searchParams.get('sort') || 'rating';
  const selectedSort = [
    'rating',
    'price-asc',
    'price-desc',
    'date',
    'az',
    'za',
  ].includes(sortParamFromUrl)
    ? sortParamFromUrl
    : 'rating';
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  const {
    data: categoryPages,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    refetch: refetchCategories,
    fetchNextPage: fetchMoreCategories,
    hasNextPage: hasMoreCategories,
    isFetchingNextPage: isLoadingMoreCategories,
    isFetchNextPageError: isLoadMoreCategoriesError,
  } = usePaginatedCategories();
  const categories = useMemo(
    () => [
      ...new Map(
        (categoryPages?.pages.flatMap(page => page.content) ?? []).map(
          category => [category.categoryId, category]
        )
      ).values(),
    ],
    [categoryPages]
  );

  const { isFavorite, isFavoritePending, toggleFavorite } = useToggleFavorite({
    onAuthRequired: () => setIsLoginPromptOpen(true),
  });

  const queryParams = useMemo<GetProductsPayload>(() => {
    const params: GetProductsPayload = {
      page: currentPage,
      size: PAGE_SIZE,
    };

    if (selectedCategoryId !== undefined)
      params.categoryId = selectedCategoryId;
    // A minimum above the maximum is shown as an error, so it is not sent.
    const isPriceRangeValid = debouncedPriceRange[0] <= debouncedPriceRange[1];
    if (isPriceRangeValid && debouncedPriceRange[0] > DEFAULT_MIN_PRICE)
      params.minPrice = debouncedPriceRange[0];
    if (isPriceRangeValid && searchParams.has('maxPrice'))
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
    searchParams,
  ]);

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useGetProducts(queryParams);

  useEffect(() => {
    if (
      isLoadingProducts ||
      isProductsError ||
      !productsData ||
      currentPage === 0 ||
      currentPage < productsData.totalPages
    )
      return;
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        if (productsData.totalPages <= 1) next.delete('page');
        else next.set('page', String(productsData.totalPages));
        return next;
      },
      { replace: true }
    );
  }, [
    currentPage,
    productsData,
    isLoadingProducts,
    isProductsError,
    setSearchParams,
  ]);

  const missingCategoryIds = [
    ...(productsData?.content.map(product => product.categoryId) ?? []),
    ...(selectedCategoryId !== undefined ? [selectedCategoryId] : []),
  ].filter(id => !categories.some(category => category.categoryId === id));
  const categoryDetails = useCategoriesByIds(missingCategoryIds);
  const categoryMap = new Map(
    categories.map(category => [category.categoryId, category.name])
  );
  categoryDetails.forEach(({ data }) => {
    if (data) categoryMap.set(data.categoryId, data.name);
  });
  useCatalogScrollRestoration(
    !isLoadingProducts &&
      !isLoadingCategories &&
      !categoryDetails.some(query => query.isLoading)
  );
  const sidebarCategories =
    selectedCategoryId !== undefined &&
    !categories.some(category => category.categoryId === selectedCategoryId)
      ? [
          {
            categoryId: selectedCategoryId,
            name:
              categoryMap.get(selectedCategoryId) ||
              `Category #${selectedCategoryId}`,
          },
          ...categories,
        ]
      : categories;

  const { addToCart } = useAddProductToCart();

  const updateParam = (key: string, value: string | null) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      if (value === null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    });
  };

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (page === 0) next.delete('page');
      else next.set('page', String(page + 1));
      return next;
    });
  };

  const handleSelectCategory = (id?: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      next.delete('categoryId');
      if (id !== undefined) {
        next.set('category', String(id));
      } else {
        next.delete('category');
      }
      return next;
    });
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        next.delete('page');
        if (range[0] > DEFAULT_MIN_PRICE) {
          next.set('minPrice', String(range[0]));
        } else {
          next.delete('minPrice');
        }
        if (range[1] < maximumPrice) {
          next.set('maxPrice', String(range[1]));
        } else {
          next.delete('maxPrice');
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleToggleOnSaleOnly = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    if (onSaleOnly) {
      next.delete('discount');
      next.delete('onSale');
    } else {
      next.set('discount', 'true');
    }
    if (isSalesPath && onSaleOnly)
      navigate({ pathname: '/catalog', search: next.toString() });
    else setSearchParams(next);
  };

  const handleSortChange = (sortId: string) => {
    updateParam('sort', sortId === 'rating' ? null : sortId);
  };

  const handleResetAll = () => {
    const next = new URLSearchParams(searchParams);
    for (const key of [
      'category',
      'categoryId',
      'minPrice',
      'maxPrice',
      'discount',
      'onSale',
      'search',
      'page',
    ])
      next.delete(key);
    if (isSalesPath)
      navigate({ pathname: '/catalog', search: next.toString() });
    else setSearchParams(next);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        if (mode === 'grid') next.delete('view');
        else next.set('view', mode);
        return next;
      },
      { replace: true }
    );
  };

  const handleClearSearch = () => {
    updateParam('search', null);
  };

  const hasActiveFilters = Boolean(
    selectedCategoryId !== undefined ||
    onSaleOnly ||
    priceRange[0] > DEFAULT_MIN_PRICE ||
    searchParams.has('maxPrice') ||
    searchQuery.length > 0
  );

  const products = productsData?.content || [];
  const totalPages = productsData?.totalPages || 0;
  const totalElements = productsData?.totalElements || 0;

  const selectedCategoryName = selectedCategoryId
    ? categoryMap.get(selectedCategoryId)
    : undefined;

  const activeFilters: { id: string; label: string; remove: () => void }[] = [];
  if (selectedCategoryId !== undefined)
    activeFilters.push({
      id: 'category',
      label: `Category: ${selectedCategoryName || `#${selectedCategoryId}`}`,
      remove: () => handleSelectCategory(undefined),
    });
  if (minPriceParam > DEFAULT_MIN_PRICE)
    activeFilters.push({
      id: 'minPrice',
      label: `Min price: ${formatCurrency(minPriceParam)}`,
      remove: () => updateParam('minPrice', null),
    });
  if (searchParams.has('maxPrice'))
    activeFilters.push({
      id: 'maxPrice',
      label: `Max price: ${formatCurrency(maxPriceParam)}`,
      remove: () => updateParam('maxPrice', null),
    });
  if (onSaleOnly)
    activeFilters.push({
      id: 'discount',
      label: 'On sale',
      remove: handleToggleOnSaleOnly,
    });
  if (searchQuery)
    activeFilters.push({
      id: 'search',
      label: `Search: ${searchQuery}`,
      remove: handleClearSearch,
    });

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
      <div className="page-stack">
        <Breadcrumbs />

        <SectionHeader
          title={pageTitle}
          count={isLoadingProducts ? undefined : totalElements}
          countLabel="products"
          description={pageDescription}
        />

        <div className="flex justify-center flex-col lg:flex-row items-start gap-7 pt-2">
          <CatalogFilterSidebar
            categories={sidebarCategories}
            isLoadingCategories={isLoadingCategories}
            isCategoriesError={isCategoriesError && !categoryPages}
            onRetryCategories={() => refetchCategories()}
            hasMoreCategories={hasMoreCategories}
            isLoadingMoreCategories={isLoadingMoreCategories}
            isLoadMoreCategoriesError={isLoadMoreCategoriesError}
            totalCategories={categoryPages?.pages[0]?.totalElements}
            onLoadMoreCategories={() => {
              if (hasMoreCategories && !isLoadingMoreCategories)
                void fetchMoreCategories();
            }}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleSelectCategory}
            priceRange={priceRange}
            maximumPrice={maximumPrice}
            onPriceRangeChange={handlePriceRangeChange}
            onSaleOnly={onSaleOnly}
            onToggleOnSaleOnly={handleToggleOnSaleOnly}
            onResetAll={handleResetAll}
          />

          <div className="flex-1 min-w-0 w-full flex flex-col gap-6">
            <CatalogToolbar
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              selectedSort={selectedSort}
              onSortChange={handleSortChange}
            />

            {activeFilters.length > 0 && (
              <div
                aria-label="Active filters"
                className="flex flex-wrap items-center gap-2"
              >
                {activeFilters.map(filter => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={filter.remove}
                    aria-label={`Remove ${filter.label} filter`}
                    className="flex min-h-11 min-w-0 max-w-full items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 text-left text-sm text-text hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="min-w-0 wrap-anywhere">
                      {filter.label}
                    </span>
                    <X aria-hidden="true" className="size-4 shrink-0" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="min-h-11 px-2 text-sm font-medium text-primary hover:underline"
                >
                  Clear all filters
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
              onAddToCart={addToCart}
              onAuthRequired={() => setIsLoginPromptOpen(true)}
              onResetAll={handleResetAll}
              searchQuery={searchQuery}
              hasActiveFilters={hasActiveFilters}
              isFavorite={isFavorite}
              isFavoritePending={isFavoritePending}
              onToggleFavorite={toggleFavorite}
            />

            {!isLoadingProducts && totalElements > 0 && products.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border gap-4">
                <span className="text-xs sm:text-sm text-text">
                  {showingText}
                </span>
                {totalPages > 1 && (
                  <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
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
    </LayoutPage>
  );
};

export default Catalog;
