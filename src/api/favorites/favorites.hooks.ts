import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService } from '@api/favorites/favorites.service';
import { useAppSelector } from '@api/hooks';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';
import type { FavoriteItem } from '@/types/favorites';

type FavoritesAxiosError = AxiosError<ApiErrorResponse>;

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation<FavoriteItem, FavoritesAxiosError, number>({
    mutationFn: (productId: number) =>
      favoritesService.addToFavorites(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites', productId] });
    },
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation<Record<string, never>, FavoritesAxiosError, number>({
    mutationFn: (productId: number) =>
      favoritesService.removeFromFavorites(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites', productId] });
    },
  });
};

export const useGetFavorites = (enabled: boolean = true) => {
  return useQuery<FavoriteItem[], FavoritesAxiosError>({
    queryKey: ['favorites'],
    queryFn: () => favoritesService.getFavorites(),
    enabled,
    staleTime: 60 * 1000,
  });
};

export const useFavoriteProductIds = () => {
  const { user } = useAppSelector(state => state.auth);
  const { data: favorites, isLoading } = useGetFavorites(Boolean(user));

  const favoriteIdsSet = useMemo(() => {
    if (!favorites || !Array.isArray(favorites)) return new Set<number>();
    return new Set(favorites.map(item => item.productId));
  }, [favorites]);

  return { favoriteIdsSet, isLoading };
};

export const useCheckIfProductIsFavorite = (
  productId: number,
  enabled: boolean = true
) => {
  return useQuery<boolean, FavoritesAxiosError>({
    queryKey: ['favorites', productId],
    queryFn: () => favoritesService.checkIfProductIsFavorite(productId),
    enabled: !!productId && enabled,
  });
};
