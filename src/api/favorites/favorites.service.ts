import instance from '@api/axiosInstance';
import type { ApiResponse } from '@/types/api';
import type { FavoriteItem, FavoriteState } from '@/types/favorites';
import type { PaginatedData } from '@/types/pagination';

const FAVORITES_PAGE_SIZE = 12;
const FAVORITE_MUTATION_TIMEOUT_MS = 30_000;

const fetchFavoritesPage = async (page: number) => {
  const response = await instance.get<ApiResponse<PaginatedData<FavoriteItem>>>(
    '/favorites',
    { params: { page, size: FAVORITES_PAGE_SIZE } }
  );
  return response.data.data;
};

export const favoritesService = {
  getFavorites: async (): Promise<FavoriteItem[]> => {
    const first = await fetchFavoritesPage(0);
    const rest = await Promise.all(
      Array.from({ length: Math.max(first.totalPages - 1, 0) }, (_, i) =>
        fetchFavoritesPage(i + 1)
      )
    );
    return [first, ...rest].flatMap(page => page.content);
  },

  checkIfProductIsFavorite: async (productId: number) => {
    const response = await instance.get<ApiResponse<boolean>>(
      `/favorites/${productId}`
    );
    return response.data.data;
  },

  addToFavorites: async (productId: number) => {
    const response = await instance.post<ApiResponse<FavoriteState>>(
      `/favorites/${productId}`,
      undefined,
      { timeout: FAVORITE_MUTATION_TIMEOUT_MS }
    );
    return response.data.data;
  },

  removeFromFavorites: async (productId: number) => {
    const response = await instance.delete<ApiResponse<FavoriteState>>(
      `/favorites/${productId}`,
      { timeout: FAVORITE_MUTATION_TIMEOUT_MS }
    );
    return response.data.data;
  },
};
