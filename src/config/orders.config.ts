import type { OrderStatus } from '@/types/order';

export const ORDERS_PER_PAGE = 12;

export const ORDER_DATE_SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Newest first' },
  { value: 'createdAt,asc', label: 'Oldest first' },
] as const;

export type OrderDateSort = (typeof ORDER_DATE_SORT_OPTIONS)[number]['value'];

export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  PENDING: 'Processing required',
  PAID: 'Payment confirmed',
  SHIPPED: 'Dispatched to customer',
  DELIVERED: 'Received by customer',
  CANCELLED: 'Order voided',
};
