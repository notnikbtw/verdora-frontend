import instance from '@api/axiosInstance';
import type { ApiResponse } from '@/types/api';
import type {
  PendingPaymentOrder,
  RevenueReportItem,
  RevenueReportParams,
  TopCancelledProduct,
  TopPurchasedProduct,
} from '@/types/report';

export const reportService = {
  getTopPurchased: async () => {
    const response = await instance.get<ApiResponse<TopPurchasedProduct[]>>(
      '/reports/top-purchased'
    );

    return response.data.data;
  },

  getTopCancelled: async () => {
    const response = await instance.get<ApiResponse<TopCancelledProduct[]>>(
      '/reports/top-cancelled'
    );

    return response.data.data;
  },

  getRevenue: async (params: RevenueReportParams = {}) => {
    const response = await instance.get<ApiResponse<RevenueReportItem[]>>(
      '/reports/revenue',
      { params }
    );

    return response.data.data;
  },

  getPendingPayment: async (n?: number) => {
    const response = await instance.get<ApiResponse<PendingPaymentOrder[]>>(
      '/reports/pending-payment',
      { params: { n } }
    );

    return response.data.data;
  },
};
