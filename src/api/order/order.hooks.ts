import { orderService } from '@api/order/order.service';
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';
import type { PaginatedData } from '@/types/pagination';
import type {
  AdminOrderSummary,
  AdminOrdersParams,
  Order,
  OrderStatus,
  UpdateOrderPayload,
} from '@/types/order';

import { isFinalOrderStatus } from '@/utils/order.utils';

import { clearGuestCart } from '@/utils/guestCart';

type OrderAxiosError = AxiosError<ApiErrorResponse>;

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<Order, OrderAxiosError>({
    mutationFn: () => orderService.createOrder(),
    onSuccess: () => {
      clearGuestCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<Order, OrderAxiosError, UpdateOrderPayload>({
    mutationFn: data => orderService.updateOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<Order, OrderAxiosError, number>({
    mutationFn: orderId => orderService.cancelOrder(orderId),
    onSettled: (_data, _error, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      }
    },
  });
};

export const useOrderById = (orderId: number) => {
  return useQuery<Order, OrderAxiosError>({
    queryKey: ['orders', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: Boolean(orderId && !isNaN(orderId) && orderId > 0),
    refetchInterval: query => {
      if (query.state.status === 'error' || query.state.error) return false;

      const order = query.state.data;
      if (!order) return false;

      return isFinalOrderStatus(order.status) ? false : 30_000;
    },
    refetchIntervalInBackground: false,
    retry: 1,
  });
};

export const useAllOrders = () => {
  return useQuery<Order[], OrderAxiosError>({
    queryKey: ['orders'],
    queryFn: () => orderService.getAllOrders(),
    refetchInterval: query => {
      if (query.state.status === 'error' || query.state.error) return false;

      const orders = query.state.data;
      if (!orders || orders.length === 0) return false;

      const hasActiveOrders = orders.some(o => !isFinalOrderStatus(o.status));
      return hasActiveOrders ? 30_000 : false;
    },
    refetchIntervalInBackground: false,
    retry: 1,
  });
};

// Server-filtered, paginated admin orders. No polling: callers only need a
// snapshot (e.g. dashboard counts), not the full order history.
export const useAdminOrders = (params: AdminOrdersParams) => {
  return useQuery<PaginatedData<AdminOrderSummary>, OrderAxiosError>({
    queryKey: ['orders', 'admin', params],
    queryFn: () => orderService.getAdminOrders(params),
    retry: 1,
  });
};

// Counts orders in the given statuses by asking the backend for one row per
// status and reading totalElements, instead of downloading the orders.
export const useOrderCount = (
  statuses: readonly OrderStatus[],
  range: { dateFrom: string; dateTo: string }
) => {
  return useQueries({
    queries: statuses.map(status => {
      const params: AdminOrdersParams = { status, ...range, size: 1 };
      return {
        queryKey: ['orders', 'admin', 'count', params],
        queryFn: () => orderService.getAdminOrders(params),
        select: (page: PaginatedData<AdminOrderSummary>) => page.totalElements,
        retry: 1,
      };
    }),
    combine: results => ({
      count: results.every(r => r.data !== undefined)
        ? results.reduce((sum, r) => sum + (r.data ?? 0), 0)
        : undefined,
      isPending: results.some(r => r.isPending),
      isError: results.some(r => r.isError),
    }),
  });
};
