export type AddItemToCartPayload = {
  productId: number;
  quantity: number;
};

export type RemoveItemFromCartPayload = {
  cartItemId: number;
};

export type UpdateCartItemQuantityPayload = {
  cartItemId: number;
  quantity: number;
};

export type CartItemType = {
  cartItemId: number;
  productId: number;
  productName: string;
  imageUrl: string;
  price: number;
  discountPrice?: number | null;
  quantity: number;
  subtotal: number;
};

export type Cart = {
  cartId: number;
  items: CartItemType[];
  totalPrice: number;
  shippingCost: number;
};
