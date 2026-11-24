// Values accepted by GET /orders/all and PATCH /orders/{id}/status.
export const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type DeliveryMethod = 'COURIER_DELIVERY' | 'STORE_PICKUP';

export type CheckoutPayload =
  | { deliveryMethod: 'COURIER_DELIVERY'; deliveryAddress: string }
  | { deliveryMethod: 'STORE_PICKUP'; pickupPointId: number };

export type CheckoutSummary = {
  itemsTotal: number;
  shippingCost: number;
  totalPrice: number;
};

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
  itemsTotal?: number;
  shippingCost?: number;
  items: OrderItems[];
  createdAt: string;
  estimatedDeliveryDate?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  carrier?: string | null;
  deliveryMethod?: DeliveryMethod | null;
  deliveryAddress?: string | null;
  pickupPointId?: number | null;
  shippingAddress?: string | null;
  paymentMethod?: string | null;
  invoiceUrl?: string | null;
};

export type UpdateOrderPayload = {
  orderId: number;
  status: OrderStatus;
};

export type AdminOrderSummary = Pick<
  Order,
  'orderId' | 'status' | 'totalPrice' | 'createdAt'
> & { customer: OrderCustomer };

export type OrderCustomer = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
};

export type AdminOrderDetails = AdminOrderSummary & { items: OrderItems[] };

export type AdminOrdersParams = {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
  sort?: string;
};
