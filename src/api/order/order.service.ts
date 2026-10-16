import instance from '@api/axiosInstance';
import type { ApiResponse } from '@/types/api';
import type { PaginatedData } from '@/types/pagination';
import type {
  AdminOrderSummary,
  AdminOrdersParams,
  Order,
  UpdateOrderPayload,
} from '@/types/order';

export const orderService = {
  createOrder: async () => {
    const response = await instance.post<ApiResponse<Order>>('/orders');

    return response.data.data;
  },

  getAllOrders: async () => {
    const response = await instance.get<ApiResponse<Order[]>>('/orders');

    return response.data.data;
  },

  getAdminOrders: async (params: AdminOrdersParams) => {
    const response = await instance.get<
      ApiResponse<PaginatedData<AdminOrderSummary>>
    >('/orders/all', { params });

    return response.data.data;
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
