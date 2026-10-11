import { reportService } from '@api/report/report.service';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';
import type {
  PendingPaymentOrder,
  RevenueReportItem,
  RevenueReportParams,
  TopCancelledProduct,
  TopPurchasedProduct,
} from '@/types/report';

type ReportAxiosError = AxiosError<ApiErrorResponse>;

export const useTopPurchased = () => {
  return useQuery<TopPurchasedProduct[], ReportAxiosError>({
    queryKey: ['reports', 'top-purchased'],
    queryFn: () => reportService.getTopPurchased(),
    retry: 1,
  });
};

export const useTopCancelled = () => {
  return useQuery<TopCancelledProduct[], ReportAxiosError>({
    queryKey: ['reports', 'top-cancelled'],
    queryFn: () => reportService.getTopCancelled(),
    retry: 1,
  });
};

export const useRevenueReport = (
  params: RevenueReportParams = {},
  enabled = true
) => {
  return useQuery<RevenueReportItem[], ReportAxiosError>({
    queryKey: ['reports', 'revenue', params],
    queryFn: () => reportService.getRevenue(params),
    enabled,
    retry: 1,
  });
};

export const usePendingPaymentOrders = (n?: number) => {
  return useQuery<PendingPaymentOrder[], ReportAxiosError>({
    queryKey: ['reports', 'pending-payment', n],
    queryFn: () => reportService.getPendingPayment(n),
    enabled: n !== undefined,
    retry: 1,
  });
};
