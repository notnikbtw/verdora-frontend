import type { OrderStatus } from '@/types/order';

export const RECENT_ORDERS_COUNT = 5;

// Statuses the backend accepts as an /orders/all filter (see Swagger).
export const SALE_STATUSES: readonly OrderStatus[] = [
  'PAID',
  'SHIPPED',
  'DELIVERED',
];
