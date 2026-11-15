import { useState, useMemo } from 'react';
import AdminLayout from '@components/layout/pageLayout/AdminLayout';
import AdminSectionHeader from '@components/common/section/AdminSectionHeader';
import { Button } from '@components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import AlertComponent from '@components/common/dialog/AlertComponent';

import ProductFilterBar from '@components/admin/products/ProductFilterBar';
import ProductTable from '@components/admin/products/ProductTable';
import ProductDetailsDialog from '@components/admin/products/ProductDetailsDialog';
import CreateProductDialog from '@components/admin/products/CreateProductDialog';
import EditProductDialog from '@components/admin/products/EditProductDialog';

import {
  useGetProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@api/product/product.hooks';
import { useAllCategories } from '@api/category/category.hooks';
import type { Product } from '@/types/product';
import type { AdminProductFormData } from '@/schemas/product.schema';
import { useDebounce } from 'use-debounce';

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Date added: Newest first' },
  { value: 'createdAt,asc', label: 'Date added: Oldest first' },
  { value: 'price,asc', label: 'Price: Low to High' },
  { value: 'price,desc', label: 'Price: High to Low' },
  { value: 'name,asc', label: 'Alphabetical: A–Z' },
  { value: 'name,desc', label: 'Alphabetical: Z–A' },
];

const PAGE_SIZE = 12;

const ProductManagement = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [categoryId, setCategoryId] = useState<'ALL' | number>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt,desc');

  const [selectedProductDetails, setSelectedProductDetails] =
    useState<Product | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useAllCategories();

  const categoryIdToNameMap = useMemo(() => {
    const map = new Map<number, string>();

    categoriesData.forEach(cat => {
      map.set(Number(cat.categoryId), cat.name);
    });

    return map;
  }, [categoriesData]);

  const queryParams = useMemo(() => {
    return {
      page,
      size: PAGE_SIZE,
      search: debouncedSearch.trim() || undefined,
      categoryId: categoryId === 'ALL' ? undefined : categoryId,
      sort: sortBy,
    };
  }, [page, debouncedSearch, categoryId, sortBy]);

  const {
    data: productsData,
    isLoading,
    isFetching,
    isError,
    error: productsError,
    refetch: refetchProducts,
  } = useGetProducts(queryParams);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const handleCreateSubmit = (data: AdminProductFormData) => {
    createMutation.mutate(
      {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        discountPrice: data.discountPrice
          ? Number(data.discountPrice)
          : undefined,
        categoryId: Number(data.categoryId),
        imageUrl: data.imageUrl,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
        },
      }
    );
  };

  const handleEditSubmit = (data: AdminProductFormData) => {
    if (!editingProduct) return;

    updateMutation.mutate(
      {
        id: editingProduct.productId,
        payload: {
          name: data.name,
          description: data.description,
          price: Number(data.price),
          discountPrice:
            data.discountPrice !== undefined && data.discountPrice !== null
              ? Number(data.discountPrice)
              : undefined,
          categoryId: Number(data.categoryId),
          imageUrl: data.imageUrl,
        },
      },
      {
        onSuccess: () => {
          setEditingProduct(null);
        },
      }
    );
  };

  const handleDeleteProduct = () => {
    if (!deletingProduct) return;
    deleteMutation.mutate(deletingProduct.productId, {
      onSuccess: () => {
        setDeletingProduct(null);
      },
    });
  };

  const products = productsData?.content || [];
  const totalPages = productsData?.totalPages || (products.length > 0 ? 1 : 0);
  const totalElements = productsData?.totalElements ?? products.length;

  const hasActiveFilters = Boolean(
    search.trim() ||
    (categoryId && categoryId !== 'ALL') ||
    sortBy !== 'createdAt,desc'
  );

  return (
    <AdminLayout>
      <AdminSectionHeader
        title="Product Management"
        count={totalElements}
        description="Monitor, search, filter, and manage products across your store catalog."
      >
        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => refetchProducts()}
            disabled={isFetching}
            className="cursor-pointer gap-2 w-full sm:w-auto"
          >
            <RefreshCw
              className={`size-4 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => {
              createMutation.reset();
              setIsCreateOpen(true);
            }}
            className="cursor-pointer gap-2 w-full sm:w-auto"
            disabled={isCategoriesLoading || isCategoriesError}
          >
            <Plus className="size-4" />
            Create product
          </Button>
        </div>
      </AdminSectionHeader>
      <ProductFilterBar
        search={search}
        categoryId={categoryId}
        isCategoriesError={isCategoriesError}
        sortBy={sortBy}
        categoriesData={categoriesData}
        isCategoriesLoading={isCategoriesLoading}
        sortOptions={SORT_OPTIONS}
        onSearchChange={e => {
          setSearch(e.target.value);
          setPage(0);
        }}
        onCategoryChange={e => {
          setCategoryId(
            e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
          );
          setPage(0);
        }}
        onSortChange={e => {
          setSortBy(e.target.value);
          setPage(0);
        }}
        onClearSearch={() => {
          setSearch('');
          setPage(0);
        }}
        onClearCategory={() => {
          setCategoryId('ALL');
          setPage(0);
        }}
        onClearSort={() => {
          setSortBy('createdAt,desc');
          setPage(0);
        }}
        onClearAllFilters={() => {
          setSearch('');
          setCategoryId('ALL');
          setSortBy('createdAt,desc');
          setPage(0);
        }}
      />

      <ProductTable
        products={products}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        error={productsError}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        hasActiveFilters={hasActiveFilters}
        search={search}
        categoryId={categoryId}
        categoryIdToNameMap={categoryIdToNameMap}
        onPageChange={setPage}
        onRefetch={refetchProducts}
        onClearAllFilters={() => {
          setSearch('');
          setCategoryId('ALL');
          setSortBy('createdAt,desc');
          setPage(0);
        }}
        onViewDetails={setSelectedProductDetails}
        onEdit={prod => {
          updateMutation.reset();
          setEditingProduct(prod);
        }}
        onDelete={setDeletingProduct}
        onCreateOpen={() => {
          createMutation.reset();
          setIsCreateOpen(true);
        }}
      />

      <ProductDetailsDialog
        product={selectedProductDetails}
        categoryName={
          selectedProductDetails
            ? categoryIdToNameMap.get(selectedProductDetails.categoryId) ||
              `Category ${selectedProductDetails.categoryId}`
            : ''
        }
        onClose={() => setSelectedProductDetails(null)}
        onEdit={prod => {
          updateMutation.reset();
          setEditingProduct(prod);
        }}
      />

      <CreateProductDialog
        open={isCreateOpen}
        categoriesData={categoriesData}
        onSubmit={handleCreateSubmit}
        onOpenChange={setIsCreateOpen}
        isPending={createMutation.isPending}
        errorMessage={createMutation.error?.response?.data?.message}
      />

      <EditProductDialog
        product={editingProduct}
        categoriesData={categoriesData}
        onSubmit={handleEditSubmit}
        onOpenChange={open => {
          if (!open) setEditingProduct(null);
        }}
        isPending={updateMutation.isPending}
        errorMessage={updateMutation.error?.response?.data?.message}
      />

      <AlertComponent
        title="Delete Product"
        description={`Are you sure you want to delete product "${deletingProduct?.name}"? This action cannot be undone.`}
        isAlertDialogOpen={!!deletingProduct}
        onOpenChange={open => {
          if (!open) {
            setDeletingProduct(null);
            deleteMutation.reset();
          }
        }}
        actionText="Delete Product"
        loadingText="Deleting..."
        isDeleting={deleteMutation.isPending}
        errorText={deleteMutation.error?.response?.data?.message}
        onAction={handleDeleteProduct}
      />
    </AdminLayout>
  );
};

export default ProductManagement;
