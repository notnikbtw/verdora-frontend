export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'CONFIRMED'
  | 'PENDING_PAYMENT'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderItems = {
  orderItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  subtotal: number;
  imageUrl?: string | null;
  categoryName?: string | null;
};

export type Order = {
  orderId: number;
  status: OrderStatus;
  totalPrice: number;
  items: OrderItems[];
  createdAt: string;
  estimatedDeliveryDate?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  carrier?: string | null;
  deliveryMethod?: string | null;
  shippingAddress?: string | null;
  paymentMethod?: string | null;
  invoiceUrl?: string | null;
};

export type UpdateOrderPayload = {
  orderId: number;
  status: OrderStatus;
};
