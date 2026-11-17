import type { OrderStatus } from '@/types/order';

export const ORDERS_PER_PAGE = 12;

export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  PENDING: 'Processing required',
  PAID: 'Payment confirmed',
  SHIPPED: 'Dispatched to customer',
  DELIVERED: 'Received by customer',
  CANCELLED: 'Order voided',
};
