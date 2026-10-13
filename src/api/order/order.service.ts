import instance from '@api/axiosInstance';
import type { ApiResponse } from '@/types/api';
import type { Order, UpdateOrderPayload } from '@/types/order';
import type { PaginatedData } from '@/types/pagination';

const ORDERS_PAGE_SIZE = 12;

const fetchOrdersPage = async (page: number) => {
  const response = await instance.get<ApiResponse<PaginatedData<Order>>>(
    '/orders',
    { params: { page, size: ORDERS_PAGE_SIZE } }
  );

  return response.data.data;
};

export const orderService = {
  createOrder: async () => {
    const response = await instance.post<ApiResponse<Order>>('/orders');

    return response.data.data;
  },

  // GET /orders is paginated (current user's orders); load every page so the
  // UI can work with the complete list.
  getAllOrders: async (): Promise<Order[]> => {
    const first = await fetchOrdersPage(0);
    const rest = await Promise.all(
      Array.from({ length: Math.max(first.totalPages - 1, 0) }, (_, i) =>
        fetchOrdersPage(i + 1)
      )
    );

    return [first, ...rest].flatMap(page => page.content);
  },

  getOrderById: async (orderId: number) => {
    const response = await instance.get<ApiResponse<Order>>(
      `/orders/${orderId}`
    );

    return response.data.data;
  },

  updateOrder: async ({ orderId, status }: UpdateOrderPayload) => {
    const response = await instance.patch<ApiResponse<Order>>(
      `/orders/${orderId}/status`,
      { status }
    );

    return response.data.data;
  },

  cancelOrder: async (orderId: number) => {
    const response = await instance.delete<ApiResponse<Order>>(
      `/orders/${orderId}`
    );

    return response.data.data;
  },
};
