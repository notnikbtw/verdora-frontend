import instance from '@api/axiosInstance';
import type { ApiResponse } from '@/types/api';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  DeleteCategoryPayload,
  GetCategoryByIdPayload,
} from '@/types/category';

export const categoryService = {
  createCategory: async (data: CreateCategoryPayload) => {
    const response = await instance.post<ApiResponse<Category>>(
      '/categories',
      data
    );
    return response.data.data;
  },

  updateCategoty: async (data: UpdateCategoryPayload) => {
    const response = await instance.put<ApiResponse<Category>>(
      `/categories/${data.categoryId}`,
      data
    );
    return response.data.data;
  },

  deleteCategoty: async (data: DeleteCategoryPayload) => {
    const response = await instance.delete<ApiResponse<void>>(
      `/categories/${data.categoryId}`
    );
    return response.data.data;
  },

  getCategotyById: async (data: GetCategoryByIdPayload) => {
    const response = await instance.get<ApiResponse<Category>>(
      `/categories/${data.categoryId}`
    );
    return response.data.data;
  },

  getAllCategories: async () => {
    const response =
      await instance.get<ApiResponse<Category[] | { content: Category[] }>>(
        `/categories`
      );
    const data = response.data.data;
    if (Array.isArray(data)) return data;
    if (data && 'content' in data && Array.isArray(data.content)) {
      return data.content;
    }
    return [];
  },
};
