import { useEffect } from 'react';
import { cartService } from '@api/cart/cart.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@api/hooks';
import { store } from '@api/store';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';
import type {
  AddItemToCartPayload,
  Cart,
  RemoveItemFromCartPayload,
  UpdateCartItemQuantityPayload,
} from '@/types/cart';
import type { Product } from '@/types/product';
import type { UserType } from '@/types/user';
import {
  guestCartService,
  GUEST_CART_STORAGE_KEY,
  calculateCartItemPrices,
  calculateCartTotals,
  type CartService,
} from '@/utils/guestCart';

type CartAxiosError = AxiosError<ApiErrorResponse>;

export type AddItemToCartArgs = AddItemToCartPayload & {
  product?: Partial<Product>;
};

export const getCartQueryKey = (user: UserType | null) =>
  ['cart', user ? user.id : 'guest'] as const;

export const getActiveCartQueryKey = () =>
  getCartQueryKey(store.getState().auth.user);

export const waitForAuthHydration = (
  timeoutMs = 5000
): Promise<UserType | null> => {
  const state = store.getState().auth;
  if (!state.hydrating) {
    return Promise.resolve(state.user);
  }

  return new Promise(resolve => {
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        unsubscribe();
        resolve(store.getState().auth.user);
      }
    }, timeoutMs);

    const unsubscribe = store.subscribe(() => {
      const currentState = store.getState().auth;
      if (!currentState.hydrating) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          unsubscribe();
          resolve(currentState.user);
        }
      }
    });
  });
};

/**
 * Selects the cart service (backend vs guest) and query key in a single place.
 */
export const useCartClient = () => {
  const queryClient = useQueryClient();
  const { user, hydrating } = useAppSelector(state => state.auth);
  const cartKey = getCartQueryKey(user);

  const getService = async (): Promise<CartService> => {
    let currentUser = store.getState().auth.user;
    if (store.getState().auth.hydrating) {
      currentUser = await waitForAuthHydration();
    }
    return currentUser ? cartService : guestCartService;
  };

  const updateCartCache = (newCart: Cart) => {
    const key = getActiveCartQueryKey();
    queryClient.setQueryData(key, newCart);
  };

  return {
    user,
    hydrating,
    cartKey,
    getService,
    updateCartCache,
  };
};

export const useGetCart = (options?: { enabled?: boolean }) => {
  const { hydrating, cartKey, getService } = useCartClient();

  return useQuery<Cart, CartAxiosError>({
    queryKey: cartKey,
    queryFn: async () => {
      const service = await getService();
      return service.getCart();
    },
    enabled: (options?.enabled ?? true) && !hydrating,
    retry: false,
    staleTime: 30 * 1000,
    ...options,
  });
};

export const useAddItemToCart = () => {
  const { getService, updateCartCache } = useCartClient();

  return useMutation<Cart, CartAxiosError, AddItemToCartArgs>({
    mutationFn: async data => {
      const service = await getService();
      return service.addItemToCart({
        productId: data.productId,
        quantity: data.quantity,
      });
    },
    onSuccess: updateCartCache,
  });
};

export const useRemoveItemFromCart = () => {
  const queryClient = useQueryClient();
  const { getService, updateCartCache } = useCartClient();

  return useMutation<
    Cart,
    CartAxiosError,
    RemoveItemFromCartPayload,
    { previousCart?: Cart; activeKey: readonly unknown[] }
  >({
    mutationFn: async data => {
      const service = await getService();
      return service.removeItemFromCart(data);
    },
    onMutate: async variables => {
      const activeKey = getActiveCartQueryKey();
      await queryClient.cancelQueries({ queryKey: activeKey });
      const previousCart = queryClient.getQueryData<Cart>(activeKey);

      queryClient.setQueryData<Cart>(activeKey, old => {
        if (!old) return old;

        const filteredItems = old.items.filter(
          item => item.cartItemId !== variables.cartItemId
        );
        const shippingCost = old.shippingCost ?? 0;
        const { totalPrice } = calculateCartTotals(filteredItems, shippingCost);

        return {
          ...old,
          items: filteredItems,
          totalPrice,
        };
      });

      return { previousCart, activeKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCart && context?.activeKey) {
        queryClient.setQueryData(context.activeKey, context.previousCart);
      }
    },
    onSuccess: (data, _variables, context) => {
      if (context?.activeKey) {
        queryClient.setQueryData(context.activeKey, data);
      } else {
        updateCartCache(data);
      }
    },
  });
};

export const useUpdateCartItemQuantity = () => {
  const queryClient = useQueryClient();
  const { getService, updateCartCache } = useCartClient();

  return useMutation<
    Cart,
    CartAxiosError,
    UpdateCartItemQuantityPayload,
    { previousCart?: Cart; activeKey: readonly unknown[] }
  >({
    mutationFn: async data => {
      const service = await getService();
      return service.updateCartItemQuantity(data);
    },
    onMutate: async variables => {
      const activeKey = getActiveCartQueryKey();
      await queryClient.cancelQueries({ queryKey: activeKey });
      const previousCart = queryClient.getQueryData<Cart>(activeKey);

      queryClient.setQueryData<Cart>(activeKey, old => {
        if (!old) {
          return old;
        }

        const updatedItems = old.items.map(item => {
          if (item.cartItemId !== variables.cartItemId) {
            return item;
          }
          const { discountPrice, subtotal } = calculateCartItemPrices(
            item.price ?? 0,
            item.discountPrice,
            variables.quantity
          );
          return {
            ...item,
            quantity: variables.quantity,
            discountPrice,
            subtotal,
          };
        });

        const shippingCost = old.shippingCost ?? 0;
        const { totalPrice } = calculateCartTotals(updatedItems, shippingCost);

        return {
          ...old,
          items: updatedItems,
          totalPrice,
        };
      });

      return { previousCart, activeKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCart && context?.activeKey) {
        queryClient.setQueryData(context.activeKey, context.previousCart);
      }
    },
    onSuccess: (data, _variables, context) => {
      if (context?.activeKey) {
        queryClient.setQueryData(context.activeKey, data);
      } else {
        updateCartCache(data);
      }
    },
  });
};

export const useClearCart = () => {
  const { getService, updateCartCache } = useCartClient();

  return useMutation<Cart, CartAxiosError>({
    mutationFn: async () => {
      const service = await getService();
      return service.clearCart();
    },
    onSuccess: updateCartCache,
  });
};

export const useSyncCartOnStorage = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === GUEST_CART_STORAGE_KEY || event.key === null) {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    };

    const handleGuestCartSynced = () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('guest-cart-synced', handleGuestCartSynced);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('guest-cart-synced', handleGuestCartSynced);
    };
  }, [queryClient]);
};
