import instance from '@api/axiosInstance';
import type { ApiResponse } from '@/types/api';
import type { PaginatedData } from '@/types/pagination';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  DeleteCategoryPayload,
  GetCategoryByIdPayload,
} from '@/types/category';

type RawCategory = {
  categoryId: number | string;
  name: string;
  imageUrl?: string | null;
};

const CATEGORIES_PAGE_SIZE = 100;

const normalizeCategory = (cat: RawCategory): Category => ({
  ...cat,
  categoryId: Number(cat.categoryId),
});

export const categoryService = {
  createCategory: async (data: CreateCategoryPayload): Promise<Category> => {
    const response = await instance.post<ApiResponse<RawCategory>>(
      '/categories',
      data
    );
    return normalizeCategory(response.data.data);
  },

  updateCategoty: async (data: UpdateCategoryPayload): Promise<Category> => {
    const response = await instance.put<ApiResponse<RawCategory>>(
      `/categories/${data.categoryId}`,
      data
    );
    return normalizeCategory(response.data.data);
  },

  deleteCategoty: async (data: DeleteCategoryPayload) => {
    const response = await instance.delete<ApiResponse<void>>(
      `/categories/${data.categoryId}`
    );
    return response.data.data;
  },

  getCategotyById: async (data: GetCategoryByIdPayload): Promise<Category> => {
    const response = await instance.get<ApiResponse<RawCategory>>(
      `/categories/${data.categoryId}`
    );
    return normalizeCategory(response.data.data);
  },

  // GET /categories is paginated; load every page so the UI gets the full list.
  getAllCategories: async (): Promise<Category[]> => {
    const fetchPage = async (page: number) => {
      const response = await instance.get<
        ApiResponse<PaginatedData<RawCategory>>
      >('/categories', { params: { page, size: CATEGORIES_PAGE_SIZE } });

      return response.data.data;
    };

    const first = await fetchPage(0);
    const rest = await Promise.all(
      Array.from({ length: Math.max(first.totalPages - 1, 0) }, (_, i) =>
        fetchPage(i + 1)
      )
    );

    return [first, ...rest]
      .flatMap(page => page.content)
      .map(normalizeCategory);
  },
};
