import {
  useQuery,
  useQueries,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { categoryService } from '@api/category/category.service';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types/category';

type CategoryAxiosError = AxiosError<ApiErrorResponse>;

export const usePaginatedCategories = () =>
  useInfiniteQuery({
    queryKey: ['categories', 'infinite', { size: 10, sort: 'id,asc' }],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      categoryService.getCategories({
        page: pageParam,
        size: 10,
        sort: 'id,asc',
      }),
    getNextPageParam: lastPage =>
      lastPage.number + 1 < lastPage.totalPages
        ? lastPage.number + 1
        : undefined,
  });

export const useCategoriesByIds = (ids: number[]) =>
  useQueries({
    queries: [...new Set(ids)].map(categoryId => ({
      queryKey: ['categories', categoryId],
      queryFn: () => categoryService.getCategotyById({ categoryId }),
      staleTime: 5 * 60 * 1000,
    })),
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<Category, CategoryAxiosError, CreateCategoryPayload>({
    mutationFn: data => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<Category, CategoryAxiosError, UpdateCategoryPayload>({
    mutationFn: data => categoryService.updateCategoty(data),
    onSuccess: updatedCategory => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({
        queryKey: ['categories', updatedCategory.categoryId],
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<void, CategoryAxiosError, { categoryId: number }>({
    mutationFn: data => categoryService.deleteCategoty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useAllCategories = () => {
  const query = useQuery<Category[], CategoryAxiosError>({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
  });

  return {
    ...query,
    data: query.data ?? [],
  };
};

export const useCategoryById = (categoryId: number) => {
  return useQuery<Category, CategoryAxiosError>({
    queryKey: ['categories', categoryId],
    queryFn: () => categoryService.getCategotyById({ categoryId }),
    enabled: !!categoryId,
  });
};
