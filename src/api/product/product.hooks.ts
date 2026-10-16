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

export const useGetProductOfTheDay = () => {
  return useQuery<Product, ProductAxiosError>({
    queryKey: ['products', 'product-of-the-day'],
    queryFn: () => productService.getProductOfTheDay(),
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

// The API has no dedicated endpoint: a discount is removed by saving the
// product again (PUT replaces the product) without a discountPrice.
export const useRemoveProductDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation<Product, ProductAxiosError, Product>({
    mutationFn: product =>
      productService.updateProduct(product.productId, {
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
        discountPrice: null,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useUpdateProductPricing = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Product,
    ProductAxiosError,
    { product: Product; price: number; discountPrice: number | null }
  >({
    mutationFn: ({ product, price, discountPrice }) =>
      productService.updateProduct(product.productId, {
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
        price,
        discountPrice,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
};
