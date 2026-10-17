import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import AdminLayout from '@components/layout/pageLayout/AdminLayout';
import AdminSectionHeader from '@components/common/section/AdminSectionHeader';
import AlertComponent from '@components/common/dialog/AlertComponent';
import { Button } from '@components/ui/button';
import DiscountFilterBar from '@components/admin/discounts/DiscountFilterBar';
import DiscountFormDialog, {
  type DiscountFormMode,
} from '@components/admin/discounts/DiscountFormDialog';
import DiscountTable from '@components/admin/discounts/DiscountTable';
import ProductOfTheDayCard from '@components/admin/discounts/ProductOfTheDayCard';
import {
  useGetProductOfTheDay,
  useGetProducts,
  useUpdateProductDiscount,
} from '@api/product/product.hooks';
import { useAllCategories } from '@api/category/category.hooks';
import {
  DEFAULT_DISCOUNT_FILTER,
  DEFAULT_DISCOUNT_SORT,
  DISCOUNT_FILTER_OPTIONS,
  DISCOUNT_PAGE_SIZE,
  DISCOUNT_SEARCH_DEBOUNCE_MS,
  DISCOUNT_SORT_OPTIONS,
  type DiscountFilter,
} from '@/config/discount.config';
import type { DiscountFormData } from '@/schemas/discount.schema';
import type { Product } from '@/types/product';
import { formatCurrency } from '@/utils/order.utils';

const DiscountManagement = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, DISCOUNT_SEARCH_DEBOUNCE_MS);
  const [filter, setFilter] = useState<DiscountFilter>(DEFAULT_DISCOUNT_FILTER);
  const [sortBy, setSortBy] = useState(DEFAULT_DISCOUNT_SORT);
  // The targets outlive the dialogs' open state so their content does not
  // change while the closing animation runs.
  const [removingProduct, setRemovingProduct] = useState<Product | null>(null);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<{
    product: Product;
    mode: DiscountFormMode;
  } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: categoriesData } = useAllCategories();

  const categoryIdToNameMap = useMemo(() => {
    const map = new Map<number, string>();
    categoriesData.forEach(cat => map.set(Number(cat.categoryId), cat.name));
    return map;
  }, [categoriesData]);

  const queryParams = useMemo(
    () => ({
      page,
      size: DISCOUNT_PAGE_SIZE,
      search: debouncedSearch.trim() || undefined,
      discount: filter === 'DISCOUNTED' ? true : undefined,
      sort: sortBy,
    }),
    [page, debouncedSearch, filter, sortBy]
  );

  const {
    data: productsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetProducts(queryParams);

  const productOfTheDay = useGetProductOfTheDay();
  const discountMutation = useUpdateProductDiscount();

  const products = productsData?.content ?? [];
  const totalPages = productsData?.totalPages || (products.length > 0 ? 1 : 0);
  const totalElements = productsData?.totalElements ?? products.length;

  const hasActiveFilters = Boolean(
    search.trim() ||
    filter !== DEFAULT_DISCOUNT_FILTER ||
    sortBy !== DEFAULT_DISCOUNT_SORT
  );

  const clearAllFilters = () => {
    setSearch('');
    setFilter(DEFAULT_DISCOUNT_FILTER);
    setSortBy(DEFAULT_DISCOUNT_SORT);
    setPage(0);
  };

  const openRemoveDialog = (product: Product) => {
    discountMutation.reset();
    setRemovingProduct(product);
    setIsRemoveOpen(true);
  };

  const closeRemoveDialog = () => setIsRemoveOpen(false);

  const openDiscountForm = (product: Product, mode: DiscountFormMode) => {
    discountMutation.reset();
    setFormTarget({ product, mode });
    setIsFormOpen(true);
  };

  const closeDiscountForm = () => setIsFormOpen(false);

  // When the last row of a page leaves the "Discounted only" view, step back so
  // the page is not left empty.
  const stepBackIfPageEmptied = () => {
    if (filter === 'DISCOUNTED' && products.length === 1 && page > 0) {
      setPage(page - 1);
    }
  };

  const handleEditSubmit = (data: DiscountFormData) => {
    if (!formTarget) return;
    discountMutation.mutate(
      {
        productId: formTarget.product.productId,
        price: Number(data.price),
        discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
      },
      {
        onSuccess: () => {
          stepBackIfPageEmptied();
          closeDiscountForm();
        },
      }
    );
  };

  const handleRemoveDiscount = () => {
    if (!removingProduct) return;
    discountMutation.mutate(
      { productId: removingProduct.productId, discountPrice: null },
      {
        onSuccess: () => {
          stepBackIfPageEmptied();
          closeRemoveDialog();
        },
      }
    );
  };

  return (
    <AdminLayout>
      <AdminSectionHeader
        title="Discount Management"
        count={totalElements}
        countLabel="products"
        description="Review product discounts and end promotional offers."
      >
        <Button
          variant="outline"
          onClick={() => {
            refetch();
            productOfTheDay.refetch();
          }}
          disabled={isFetching || productOfTheDay.isFetching}
          className="cursor-pointer gap-2 w-full sm:w-auto"
        >
          <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </AdminSectionHeader>

      <ProductOfTheDayCard />

      <DiscountFilterBar
        search={search}
        filter={filter}
        sortBy={sortBy}
        filterOptions={DISCOUNT_FILTER_OPTIONS}
        sortOptions={DISCOUNT_SORT_OPTIONS}
        onSearchChange={value => {
          setSearch(value);
          setPage(0);
        }}
        onFilterChange={value => {
          setFilter(value);
          setPage(0);
        }}
        onSortChange={value => {
          setSortBy(value);
          setPage(0);
        }}
      />

      <DiscountTable
        products={products}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        error={error}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        hasActiveFilters={hasActiveFilters}
        hasSearch={Boolean(search.trim())}
        discountedOnly={filter === 'DISCOUNTED'}
        categoryIdToNameMap={categoryIdToNameMap}
        onPageChange={setPage}
        onRefetch={refetch}
        onClearAllFilters={clearAllFilters}
        onShowAll={() => {
          setFilter('ALL');
          setPage(0);
        }}
        onSetDiscount={product => openDiscountForm(product, 'set')}
        onEditDiscount={product => openDiscountForm(product, 'edit')}
        onRemoveDiscount={openRemoveDialog}
      />

      <DiscountFormDialog
        open={isFormOpen}
        product={formTarget?.product ?? null}
        mode={formTarget?.mode ?? 'edit'}
        onSubmit={handleEditSubmit}
        onOpenChange={open => {
          if (!open) closeDiscountForm();
        }}
        isPending={discountMutation.isPending}
        fieldErrors={discountMutation.error?.response?.data?.errors}
        errorMessage={discountMutation.error?.response?.data?.message}
      />

      <AlertComponent
        title="Remove discount"
        description={`Remove the discount from "${removingProduct?.name}"? It will return to its regular price of ${formatCurrency(removingProduct?.price)}.`}
        isAlertDialogOpen={isRemoveOpen}
        onOpenChange={open => {
          if (!open) closeRemoveDialog();
        }}
        actionText="Remove discount"
        loadingText="Removing..."
        isDeleting={discountMutation.isPending}
        errorText={discountMutation.error?.response?.data?.message}
        onAction={handleRemoveDiscount}
      />
    </AdminLayout>
  );
};

export default DiscountManagement;
