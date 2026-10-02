import instance from '@api/axiosInstance';
import type { ApiResponse } from '@/types/api';
import type { FavoriteItem } from '@/types/favorites';

export const favoritesService = {
  getFavorites: async () => {
    const response =
      await instance.get<ApiResponse<FavoriteItem[]>>('/favorites');
    return response.data.data;
  },

  checkIfProductIsFavorite: async (productId: number) => {
    const response = await instance.get<ApiResponse<boolean>>(
      `/favorites/${productId}`
    );
    return response.data.data;
  },

  addToFavorites: async (productId: number) => {
    const response = await instance.post<ApiResponse<FavoriteItem>>(
      `/favorites/${productId}`
    );
    return response.data.data;
  },

  removeFromFavorites: async (productId: number) => {
    const response = await instance.delete<ApiResponse<Record<string, never>>>(
      `/favorites/${productId}`
    );
    return response.data.data;
  },
};
