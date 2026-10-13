import { useCallback, useRef, useState } from 'react';
import { useAppSelector } from '@api/hooks';
import {
  useAddToFavorites,
  useRemoveFromFavorites,
  useFavoriteProductIds,
} from '@api/favorites/favorites.hooks';

type UseToggleFavoriteOptions = {
  onAuthRequired?: () => void;
};

export const useToggleFavorite = ({
  onAuthRequired,
}: UseToggleFavoriteOptions = {}) => {
  const { user } = useAppSelector(state => state.auth);
  const { favoriteIdsSet, isLoading: isFavoritesLoading } =
    useFavoriteProductIds();
  const { mutate: addToFavorites } = useAddToFavorites();
  const { mutate: removeFromFavorites } = useRemoveFromFavorites();

  const pendingRef = useRef(new Set<number>());
  const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(
    () => new Set()
  );

  const setPending = useCallback((productId: number, pending: boolean) => {
    if (pending) pendingRef.current.add(productId);
    else pendingRef.current.delete(productId);
    setPendingIds(new Set(pendingRef.current));
  }, []);

  const toggleFavorite = useCallback(
    (productId: number) => {
      if (!user) {
        onAuthRequired?.();
        return;
      }
      if (isFavoritesLoading || pendingRef.current.has(productId)) return;

      setPending(productId, true);
      const mutate = favoriteIdsSet.has(productId)
        ? removeFromFavorites
        : addToFavorites;
      mutate(productId, { onSettled: () => setPending(productId, false) });
    },
    [
      user,
      onAuthRequired,
      isFavoritesLoading,
      favoriteIdsSet,
      addToFavorites,
      removeFromFavorites,
      setPending,
    ]
  );

  const isFavorite = useCallback(
    (productId: number) => favoriteIdsSet.has(productId),
    [favoriteIdsSet]
  );

  const isFavoritePending = useCallback(
    (productId: number) => pendingIds.has(productId),
    [pendingIds]
  );

  return {
    favoriteIdsSet,
    isFavoritesLoading,
    isFavorite,
    isFavoritePending,
    toggleFavorite,
  };
};

export default useToggleFavorite;
