import type {
  Cart,
  CartItemType,
  AddItemToCartPayload,
  RemoveItemFromCartPayload,
  UpdateCartItemQuantityPayload,
} from '@/types/cart';
import { productService } from '@api/product/product.service';
import { cartService } from '@api/cart/cart.service';
import { isAxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';
import type { Product } from '@/types/product';
import { queryClient } from '@api/queryClient';

export const fetchProductWithCache = (productId: number): Promise<Product> => {
  return queryClient.fetchQuery({
    queryKey: ['products', productId],
    queryFn: () => productService.getProductById(productId),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

export const GUEST_CART_STORAGE_KEY = 'verdora_guest_cart_v1';
const LEGACY_GUEST_CART_KEY = 'verdora_guest_cart';
export const GUEST_CART_SYNC_ERROR_KEY = 'verdora_guest_cart_sync_error';

export type StoredGuestCartItem = {
  productId: number;
  quantity: number;
};

export type StoredGuestCart = {
  version: 1;
  items: StoredGuestCartItem[];
};

export const isValidGuestCartItem = (
  item: unknown
): item is StoredGuestCartItem => {
  if (!item || typeof item !== 'object') return false;
  const { productId, quantity } = item as Record<string, unknown>;
  return (
    typeof productId === 'number' &&
    Number.isInteger(productId) &&
    productId > 0 &&
    typeof quantity === 'number' &&
    Number.isInteger(quantity) &&
    quantity > 0
  );
};

export const calculateCartItemPrices = (
  price: number,
  discountPrice?: number | null,
  quantity: number = 1
): { unitPrice: number; discountPrice?: number; subtotal: number } => {
  const hasDiscount =
    discountPrice != null && discountPrice > 0 && discountPrice < price;
  const validDiscount = hasDiscount ? discountPrice : undefined;
  const unitPrice = validDiscount ?? price;
  const subtotal = unitPrice * Math.max(1, quantity);

  return { unitPrice, discountPrice: validDiscount, subtotal };
};

export const calculateCartTotals = (
  items: CartItemType[],
  shippingCost = 0
): { totalPrice: number; shippingCost: number } => {
  const totalPrice =
    items.reduce((sum, item) => sum + item.subtotal, 0) + shippingCost;
  return { totalPrice, shippingCost };
};

export const getStoredGuestCart = (): StoredGuestCartItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      let rawItems: unknown[] = [];
      if (Array.isArray(parsed)) {
        rawItems = parsed;
      } else if (
        parsed &&
        typeof parsed === 'object' &&
        'items' in parsed &&
        Array.isArray((parsed as { items: unknown }).items)
      ) {
        rawItems = (parsed as { items: unknown[] }).items;
      } else {
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
        return [];
      }

      const validItems: StoredGuestCartItem[] = [];
      for (const item of rawItems) {
        if (isValidGuestCartItem(item)) {
          validItems.push({
            productId: item.productId,
            quantity: Math.max(1, Math.floor(item.quantity)),
          });
        }
      }

      if (validItems.length !== rawItems.length) {
        saveStoredGuestCart(validItems);
      }

      return validItems;
    }

    // Check legacy key for migration
    const legacyRaw = localStorage.getItem(LEGACY_GUEST_CART_KEY);
    if (legacyRaw) {
      try {
        const legacyParsed = JSON.parse(legacyRaw) as {
          items?: Array<{ productId?: number; quantity?: number }>;
        };
        const migratedItems: StoredGuestCartItem[] = [];
        if (legacyParsed && Array.isArray(legacyParsed.items)) {
          for (const item of legacyParsed.items) {
            if (isValidGuestCartItem(item)) {
              migratedItems.push({
                productId: item.productId,
                quantity: Math.max(1, Math.floor(item.quantity)),
              });
            }
          }
        }
        localStorage.removeItem(LEGACY_GUEST_CART_KEY);
        if (migratedItems.length > 0) {
          saveStoredGuestCart(migratedItems);
        }
        return migratedItems;
      } catch {
        localStorage.removeItem(LEGACY_GUEST_CART_KEY);
      }
    }

    return [];
  } catch {
    return [];
  }
};

export const saveStoredGuestCart = (items: StoredGuestCartItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    if (items.length === 0) {
      localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      return;
    }
    const payload: StoredGuestCart = {
      version: 1,
      items: items.map(item => ({
        productId: item.productId,
        quantity: Math.max(1, Math.floor(item.quantity)),
      })),
    };
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    return;
  }
};

export const getGuestCart = async (): Promise<Cart> => {
  const storedItems = getStoredGuestCart();
  if (storedItems.length === 0) {
    return {
      cartId: 0,
      items: [],
      totalPrice: 0,
      shippingCost: 0,
    };
  }

  // Fetch prices, names, and images from the API using React Query cache to prevent redundant requests
  const productResults = await Promise.allSettled(
    storedItems.map(item => fetchProductWithCache(item.productId))
  );

  const cartItems: CartItemType[] = [];
  const missingProductIds: number[] = [];

  for (let i = 0; i < storedItems.length; i++) {
    const item = storedItems[i];
    const result = productResults[i];

    if (result.status === 'fulfilled' && result.value) {
      const product = result.value;
      const price = product.price ?? 0;
      const { discountPrice, subtotal } = calculateCartItemPrices(
        price,
        product.discountPrice,
        item.quantity
      );

      cartItems.push({
        cartItemId: item.productId,
        productId: item.productId,
        productName: product.name ?? `Product #${item.productId}`,
        imageUrl: product.imageUrl ?? '',
        price,
        discountPrice,
        quantity: item.quantity,
        subtotal,
      });
    } else {
      const reason = result.status === 'rejected' ? result.reason : null;
      if (isAxiosError(reason) && reason.response?.status === 404) {
        // Product no longer exists, queue removal from guest storage
        missingProductIds.push(item.productId);
      } else {
        // Temporary server / network error: propagate so query shows retry without wiping storage
        throw reason || new Error(`Failed to load product #${item.productId}`);
      }
    }
  }

  if (missingProductIds.length > 0) {
    const remaining = storedItems.filter(
      i => !missingProductIds.includes(i.productId)
    );
    saveStoredGuestCart(remaining);
  }

  // Total amount calculated on the client side as a preliminary figure for the guest
  const { totalPrice, shippingCost } = calculateCartTotals(cartItems, 0);

  return {
    cartId: 0,
    items: cartItems,
    totalPrice,
    shippingCost,
  };
};

export const addGuestCartItem = async (payload: {
  productId: number;
  quantity: number;
}): Promise<Cart> => {
  if (payload.quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  // Validate that the product exists and is available before adding to cart using cache
  await fetchProductWithCache(payload.productId);

  const stored = getStoredGuestCart();
  const existingIndex = stored.findIndex(
    i => i.productId === payload.productId
  );

  if (existingIndex > -1) {
    stored[existingIndex].quantity += Math.max(1, payload.quantity);
  } else {
    stored.push({
      productId: payload.productId,
      quantity: Math.max(1, payload.quantity),
    });
  }

  saveStoredGuestCart(stored);
  return getGuestCart();
};

export const updateGuestCartItemQuantity = async (
  cartItemId: number,
  quantity: number
): Promise<Cart> => {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
  const stored = getStoredGuestCart();
  const item = stored.find(i => i.productId === cartItemId);
  if (!item) {
    throw new Error(`Item #${cartItemId} not found in cart`);
  }
  item.quantity = Math.max(1, quantity);
  saveStoredGuestCart(stored);
  return getGuestCart();
};

export const removeStoredGuestCartItem = (productId: number): void => {
  const stored = getStoredGuestCart();
  const remaining = stored.filter(i => i.productId !== productId);
  saveStoredGuestCart(remaining);
};

export const removeGuestCartItem = async (
  cartItemId: number
): Promise<Cart> => {
  removeStoredGuestCartItem(cartItemId);
  return getGuestCart();
};

export const clearGuestCart = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    localStorage.removeItem(LEGACY_GUEST_CART_KEY);
  } catch {
    return;
  }
};

export interface CartService {
  getCart(): Promise<Cart>;
  addItemToCart(data: AddItemToCartPayload): Promise<Cart>;
  updateCartItemQuantity(data: UpdateCartItemQuantityPayload): Promise<Cart>;
  removeItemFromCart(data: RemoveItemFromCartPayload): Promise<Cart>;
  clearCart(): Promise<Cart>;
}

export const guestCartService: CartService = {
  getCart: getGuestCart,
  addItemToCart: async ({ productId, quantity }) =>
    addGuestCartItem({ productId, quantity }),
  updateCartItemQuantity: async ({ cartItemId, quantity }) =>
    updateGuestCartItemQuantity(cartItemId, quantity),
  removeItemFromCart: async ({ cartItemId }) => removeGuestCartItem(cartItemId),
  clearCart: async () => {
    clearGuestCart();
    return { cartId: 0, items: [], totalPrice: 0, shippingCost: 0 };
  },
};

export const getGuestCartSyncError = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_CART_SYNC_ERROR_KEY);
};

export const setGuestCartSyncError = (message: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_CART_SYNC_ERROR_KEY, message);
  window.dispatchEvent(
    new CustomEvent('guest-cart-sync-error', { detail: message })
  );
};

export const clearGuestCartSyncError = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_CART_SYNC_ERROR_KEY);
  window.dispatchEvent(
    new CustomEvent('guest-cart-sync-error', { detail: null })
  );
};

export type SyncCartResult = {
  success: boolean;
  syncedCount: number;
  failedItems: { item: StoredGuestCartItem; error: string }[];
};

let activeSyncPromise: Promise<SyncCartResult> | null = null;

export const isGuestCartSyncing = (): boolean => activeSyncPromise !== null;

export const syncGuestCartToBackend = async (): Promise<SyncCartResult> => {
  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  activeSyncPromise = (async () => {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('guest-cart-sync-start'));
      }
      const storedItems = getStoredGuestCart();
      if (storedItems.length === 0) {
        clearGuestCartSyncError();
        return { success: true, syncedCount: 0, failedItems: [] };
      }

      const failedItems: { item: StoredGuestCartItem; error: string }[] = [];
      let syncedCount = 0;

      // Send POST requests sequentially to avoid backend cart creation race conditions
      for (const item of storedItems) {
        try {
          await cartService.addItemToCart({
            productId: item.productId,
            quantity: item.quantity,
          });
          syncedCount++;
          // Immediately remove successfully accepted item from localStorage
          removeStoredGuestCartItem(item.productId);
        } catch (err) {
          let errorMsg = 'Failed to transfer item';
          if (isAxiosError<ApiErrorResponse>(err)) {
            errorMsg = err.response?.data?.message || err.message || errorMsg;
          } else if (err instanceof Error) {
            errorMsg = err.message;
          }
          failedItems.push({ item, error: errorMsg });
        }
      }

      if (syncedCount > 0 && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('guest-cart-synced'));
      }

      if (failedItems.length > 0) {
        let productNames = '';
        try {
          const names = await Promise.all(
            failedItems.map(async f => {
              try {
                const p = await fetchProductWithCache(f.item.productId);
                return p.name;
              } catch {
                return `Product #${f.item.productId}`;
              }
            })
          );
          productNames = names.join(', ');
        } catch {
          productNames = failedItems
            .map(f => `#${f.item.productId}`)
            .join(', ');
        }
        const errorMessage = `Failed to transfer some items (${productNames}) from your guest cart to your account. They remain saved in your cart.`;
        setGuestCartSyncError(errorMessage);
        throw new Error(errorMessage);
      }

      clearGuestCartSyncError();
      clearGuestCart();
      return { success: true, syncedCount, failedItems: [] };
    } finally {
      activeSyncPromise = null;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('guest-cart-sync-end'));
      }
    }
  })();

  return activeSyncPromise;
};
