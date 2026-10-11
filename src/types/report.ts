export type ReportGroupBy = 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';

export type TopPurchasedProduct = {
  productId: number;
  productName: string;
  purchasedQuantity: number;
};

export type TopCancelledProduct = {
  productId: number;
  productName: string;
  cancelledQuantity: number;
};

export type RevenueReportParams = {
  dateFrom?: string;
  dateTo?: string;
  groupBy?: ReportGroupBy;
};

export type RevenueReportItem = {
  periodStart: string;
  revenue: number;
};

export type PendingPaymentCustomer = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

export type PendingPaymentOrder = {
  orderId: number;
  createdAt: string;
  totalPrice: number;
  pendingDays: number;
  customer: PendingPaymentCustomer;
};
