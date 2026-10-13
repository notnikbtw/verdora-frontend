import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService } from '@api/favorites/favorites.service';
import { useAppSelector } from '@api/hooks';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';
import type { FavoriteItem, FavoriteState } from '@/types/favorites';

type FavoritesAxiosError = AxiosError<ApiErrorResponse>;

interface FavoritesMutationContext {
  previousFavorites?: FavoriteItem[];
  previousIsFavorite?: boolean;
}

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation<
    FavoriteState,
    FavoritesAxiosError,
    number,
    FavoritesMutationContext
  >({
    mutationFn: (productId: number) =>
      favoritesService.addToFavorites(productId),

    onMutate: async (productId: number) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      await queryClient.cancelQueries({ queryKey: ['favorites', productId] });

      const previousFavorites = queryClient.getQueryData<FavoriteItem[]>([
        'favorites',
      ]);
      const previousIsFavorite = queryClient.getQueryData<boolean>([
        'favorites',
        productId,
      ]);

      queryClient.setQueryData<boolean>(['favorites', productId], true);

      queryClient.setQueryData<FavoriteItem[]>(['favorites'], (old = []) => {
        if (old.some(item => item.productId === productId)) return old;

        const tempItem: FavoriteItem = {
          productId,
          productName: '',
          imageUrl: '',
          price: 0,
          discountPrice: 0,
          addedAt: new Date().toISOString(),
        };

        return [...old, tempItem];
      });

      return { previousFavorites, previousIsFavorite };
    },

    onError: (_error, productId, context) => {
      if (context?.previousFavorites !== undefined) {
        queryClient.setQueryData(['favorites'], context.previousFavorites);
      }
      if (context?.previousIsFavorite !== undefined) {
        queryClient.setQueryData(
          ['favorites', productId],
          context.previousIsFavorite
        );
      }
    },

    onSettled: (_, __, productId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites', productId] });
    },
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation<
    FavoriteState,
    FavoritesAxiosError,
    number,
    FavoritesMutationContext
  >({
    mutationFn: (productId: number) =>
      favoritesService.removeFromFavorites(productId),

    onMutate: async (productId: number) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      await queryClient.cancelQueries({ queryKey: ['favorites', productId] });

      const previousFavorites = queryClient.getQueryData<FavoriteItem[]>([
        'favorites',
      ]);
      const previousIsFavorite = queryClient.getQueryData<boolean>([
        'favorites',
        productId,
      ]);

      queryClient.setQueryData<boolean>(['favorites', productId], false);
      queryClient.setQueryData<FavoriteItem[]>(['favorites'], (old = []) =>
        old.filter(item => item.productId !== productId)
      );

      return { previousFavorites, previousIsFavorite };
    },

    onError: (_error, productId, context) => {
      if (context?.previousFavorites !== undefined) {
        queryClient.setQueryData(['favorites'], context.previousFavorites);
      }
      if (context?.previousIsFavorite !== undefined) {
        queryClient.setQueryData(
          ['favorites', productId],
          context.previousIsFavorite
        );
      }
    },

    onSettled: (_, __, productId) => {
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
