import { useCallback } from 'react';
import { useAddItemToCart } from '@api/cart/cart.hooks';

type AddItemMutate = ReturnType<typeof useAddItemToCart>['mutateAsync'];
type AddItemMutateOptions = Parameters<AddItemMutate>[1];

export const useAddProductToCart = () => {
  const { mutateAsync, isPending: isAddingToCart } = useAddItemToCart();

  const addToCart = useCallback(
    (productId: number, quantity = 1, options?: AddItemMutateOptions) => {
      return mutateAsync({ productId, quantity }, options);
    },
    [mutateAsync]
  );

  return { addToCart, isAddingToCart };
};

export default useAddProductToCart;
