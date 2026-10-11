import { useCallback } from 'react';
import { useAddItemToCart } from '@api/cart/cart.hooks';

type AddItemMutate = ReturnType<typeof useAddItemToCart>['mutate'];
type AddItemMutateOptions = Parameters<AddItemMutate>[1];

export const useAddProductToCart = () => {
  const { mutate, isPending: isAddingToCart } = useAddItemToCart();

  const addToCart = useCallback(
    (productId: number, quantity = 1, options?: AddItemMutateOptions) => {
      mutate({ productId, quantity }, options);
    },
    [mutate]
  );

  return { addToCart, isAddingToCart };
};

export default useAddProductToCart;
