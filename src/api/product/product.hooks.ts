import { productService } from '@api/product/product.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';
import type { PaginatedData } from '@/types/pagination';
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  GetProductsPayload,
} from '@/types/product';

type ProductAxiosError = AxiosError<ApiErrorResponse>;

export const useGetProducts = (
  params?: GetProductsPayload,
  enabled: boolean = true
) => {
  return useQuery<PaginatedData<Product>, ProductAxiosError>({
    queryKey: ['products', params],
    queryFn: async () =>
      (await productService.getProducts(params)) ?? {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 0,
        number: 0,
      },
    enabled,
  });
};

export const useGetProductById = (id: number, enabled: boolean = true) => {
  return useQuery<Product, ProductAxiosError>({
    queryKey: ['products', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id && enabled,
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

// Resolves to null when the backend has no product of the day (HTTP 404), which
// is an expected state rather than an error.
export const useGetProductOfTheDay = () => {
  return useQuery<Product | null, ProductAxiosError>({
    queryKey: ['products', 'product-of-the-day'],
    queryFn: async () => {
      try {
        return await productService.getProductOfTheDay();
      } catch (error) {
        if ((error as ProductAxiosError).response?.status === 404) return null;
        throw error;
      }
    },
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<Product, ProductAxiosError, CreateProductPayload>({
    mutationFn: (payload: CreateProductPayload) =>
      productService.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Product,
    ProductAxiosError,
    { id: number; payload: UpdateProductPayload }
  >({
    mutationFn: ({ id, payload }) => productService.updateProduct(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<Record<string, never>, ProductAxiosError, number>({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// The API has no discount endpoint, so a discount is saved with PUT, which
// replaces the whole product. Read the current product first so the write does
// not revert fields that changed since the list was loaded. Pass discountPrice
// as null to remove the discount.
export const useUpdateProductDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Product,
    ProductAxiosError,
    { productId: number; price?: number; discountPrice: number | null }
  >({
    mutationFn: async ({ productId, price, discountPrice }) => {
      const current = await productService.getProductById(productId);
      return productService.updateProduct(productId, {
        name: current.name,
        description: current.description,
        categoryId: current.categoryId,
        imageUrl: current.imageUrl,
        price: price ?? current.price,
        discountPrice,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
};
