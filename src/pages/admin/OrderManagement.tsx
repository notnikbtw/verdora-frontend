import { scrollToTop } from '@/utils/scroll.utils';
import { useState } from 'react';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@components/layout/pageLayout/AdminLayout';
import AdminSectionHeader from '@components/common/section/AdminSectionHeader';
import { Button } from '@components/ui/button';
import OrderStatusBadge from '@/components/common/badge/OrderStatusBadge';
import {
  formatOrderDate,
  formatOrderPrice,
  getOrderStatusLabel,
} from '@/utils/order.utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import DialogComponent from '@components/common/dialog/DialogComponent';
import OrderDetailsDialog from '@components/common/dialog/OrderDetailsDialog';
import AlertComponent from '@components/common/dialog/AlertComponent';
import NoticeAlert from '@components/common/NoticeAlert';
import {
  useAdminOrders,
  useAdminOrderDetails,
  useOrderCount,
  useUpdateOrder,
} from '@api/order/order.hooks';
import type { Order, OrderStatus } from '@/types/order';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  Pencil,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  DashboardMetricCard,
  DashboardMetricCardSkeleton,
} from '@components/common/cards/DashboardMetricCard';
import { Skeleton } from '@components/ui/skeleton';
import ErrorSection from '@components/common/section/ErrorSection';
import { EmptySection } from '@components/common/section/EmptySection';
import { PaginationComponent } from '@components/common/pagination/Pagination';

const PAGE_SIZE = 12;
type OrderRef = Pick<Order, 'orderId' | 'status'>;
const FILTER_STATUSES: OrderStatus[] = [
  'PENDING',
  'PENDING_PAYMENT',
  'PAID',
  'CONFIRMED',
  'SHIPPED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
];

const OrderManagement = () => {
  const [page, setPage] = useState(0);
  const handlePageChange = (nextPage: number) => {
    scrollToTop();
    setPage(nextPage);
  };
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const {
    data: ordersPage,
    isLoading: ordersLoading,
    isError,
    error: ordersError,
    refetch: refetchOrders,
  } = useAdminOrders({
    page,
    size: PAGE_SIZE,
    sort: 'createdAt,desc',
    status: statusFilter,
  });
  const apiOrders = ordersPage?.content ?? [];
  const total = useAdminOrders({ page: 0, size: 1 });
  const pending = useOrderCount(['PENDING']);
  const paid = useOrderCount(['PAID']);
  const shipped = useOrderCount(['SHIPPED']);
  const cancelled = useOrderCount(['CANCELLED']);
  const queryClient = useQueryClient();
  const isRefetching = useIsFetching({ queryKey: ['orders', 'admin'] }) > 0;
  const updateMutation = useUpdateOrder();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const details = useAdminOrderDetails(selectedOrderId);
  const [editingOrder, setEditingOrder] = useState<OrderRef | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING');
  const [cancellingOrder, setCancellingOrder] = useState<OrderRef | null>(null);

  const moveBackIfPageEmpties = (status: OrderStatus) => {
    if (
      statusFilter &&
      statusFilter !== status &&
      apiOrders.length === 1 &&
      page > 0
    ) {
      setPage(page - 1);
    }
  };
  const handleUpdateStatus = () => {
    if (!editingOrder || updateMutation.isPending) return;
    updateMutation.mutate(
      { orderId: editingOrder.orderId, status: selectedStatus },
      {
        onSuccess: () => {
          setEditingOrder(null);
          moveBackIfPageEmpties(selectedStatus);
        },
      }
    );
  };
  const handleCancelOrder = () => {
    if (!cancellingOrder || updateMutation.isPending) return;
    updateMutation.mutate(
      { orderId: cancellingOrder.orderId, status: 'CANCELLED' },
      {
        onSuccess: () => {
          setCancellingOrder(null);
          moveBackIfPageEmpties('CANCELLED');
        },
      }
    );
  };
  const metrics = [
    {
      title: 'Total Orders',
      description: 'All recorded orders',
      value: total.data?.totalElements,
      icon: Package,
      isPending: total.isPending,
      isError: total.isError,
    },
    {
      title: 'Pending',
      description: 'Awaiting processing',
      value: pending.count,
      icon: Clock,
      ...pending,
    },
    {
      title: 'Paid',
      description: 'Payment received',
      value: paid.count,
      icon: CheckCircle2,
      ...paid,
    },
    {
      title: 'Shipped',
      description: 'In transit / fulfilled',
      value: shipped.count,
      icon: Truck,
      ...shipped,
    },
    {
      title: 'Cancelled',
      description: 'Voided orders',
      value: cancelled.count,
      icon: XCircle,
      ...cancelled,
    },
  ];

  return (
    <AdminLayout>
      <AdminSectionHeader
        title="Order Management"
        count={ordersPage?.totalElements}
        description="Monitor, process, and update customer orders across your catalog."
      >
        <Button
          variant="outline"
          onClick={() =>
            void queryClient.invalidateQueries({
              queryKey: ['orders', 'admin'],
            })
          }
          disabled={isRefetching}
          className="cursor-pointer gap-2"
        >
          <RefreshCw
            className={`size-4 ${isRefetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </AdminSectionHeader>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map(metric =>
          metric.isPending ? (
            <DashboardMetricCardSkeleton key={metric.title} />
          ) : (
            <DashboardMetricCard
              key={metric.title}
              value={metric.value?.toString() ?? 'N/A'}
              title={metric.title}
              description={metric.description}
              icon={metric.icon}
              error={metric.isError}
              errorMessage="Failed to load order count. Please refresh."
            />
          )
        )}
      </div>

      <Card className="mt-6 border-border shadow-sm">
        <CardHeader className="py-4 px-6 border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Order Records</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Showing {apiOrders.length} of {ordersPage?.totalElements ?? 0}{' '}
                orders
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="order-status-filter"
                className="text-sm font-medium"
              >
                Status
              </label>
              <select
                id="order-status-filter"
                value={statusFilter ?? ''}
                onChange={event => {
                  setStatusFilter(
                    event.target.value
                      ? (event.target.value as OrderStatus)
                      : undefined
                  );
                  setPage(0);
                }}
                className="min-h-11 rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm"
              >
                <option value="">All statuses</option>
                {FILTER_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {getOrderStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {ordersLoading ? (
            <div
              className="space-y-4 p-6"
              role="status"
              aria-label="Loading orders"
            >
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="py-8">
              <ErrorSection
                title="Failed to load orders"
                message={
                  ordersError?.response?.data?.message ||
                  ordersError?.message ||
                  'Unable to load orders.'
                }
                onRetry={() => void refetchOrders()}
                retryText="Try again"
              />
            </div>
          ) : apiOrders.length === 0 ? (
            <EmptySection
              title="No orders found"
              description={
                statusFilter
                  ? 'No orders match the selected status. Choose another status or All statuses.'
                  : 'There are no customer orders recorded in the system yet.'
              }
              className="px-6 py-12"
              icon={
                <Package className="size-8 text-primary" aria-hidden="true" />
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-25 pl-6">Order ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiOrders.map(order => (
                  <TableRow key={order.orderId} className="hover:bg-muted/30">
                    <TableCell className="font-semibold pl-6">
                      #{order.orderId}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatOrderDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">
                        {order.customer?.name || 'Unknown customer'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer?.email || '—'}
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatOrderPrice(order.totalPrice)}
                    </TableCell>
                    <TableCell className="text-center">
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrderId(order.orderId)}
                          className="h-8 px-2 text-xs"
                          title="View order details"
                        >
                          <Eye className="size-3.5 mr-1" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateMutation.isPending}
                          onClick={() => {
                            updateMutation.reset();
                            setEditingOrder(order);
                            setSelectedStatus(order.status);
                          }}
                          className="h-8 px-2 text-xs"
                          title="Edit order status"
                        >
                          <Pencil className="size-3.5 mr-1" />
                          Status
                        </Button>
                        {order.status !== 'CANCELLED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={updateMutation.isPending}
                            onClick={() => {
                              updateMutation.reset();
                              setCancellingOrder(order);
                            }}
                            className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                            title="Cancel order"
                          >
                            <XCircle className="size-3.5 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {ordersPage && ordersPage.totalPages > 1 && (
          <div className="flex justify-center py-4">
            <PaginationComponent
              currentPage={page}
              totalPages={ordersPage.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>

      <OrderDetailsDialog
        order={details.data ?? null}
        customer={details.data?.customer}
        open={selectedOrderId !== null}
        isLoading={details.isPending}
        errorMessage={
          details.error?.response?.data?.message || details.error?.message
        }
        onRetry={() => void details.refetch()}
        showFullPageLink={false}
        onOpenChange={open => {
          if (!open) setSelectedOrderId(null);
        }}
        onEditStatus={order => {
          updateMutation.reset();
          setEditingOrder(order);
          setSelectedStatus(order.status);
        }}
      />

      <DialogComponent
        open={!!editingOrder}
        onOpenChange={open => {
          if (!open) {
            setEditingOrder(null);
            updateMutation.reset();
          }
        }}
        headerTitle={`Update Order #${editingOrder?.orderId} Status`}
        headerDescription="Select a new status for this order."
        cancelText="Cancel"
        submitText="Update Status"
        onSubmit={handleUpdateStatus}
        submitDisabled={
          !editingOrder ||
          selectedStatus === editingOrder.status ||
          updateMutation.isPending
        }
        loading={updateMutation.isPending}
        autoCloseOnSubmit={false}
      >
        <div className="space-y-4 py-2">
          {updateMutation.isPending && (
            <div className="flex items-center justify-center gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Updating status...</span>
            </div>
          )}

          {updateMutation.isError && (
            <NoticeAlert
              variant="error"
              message={
                updateMutation.error?.response?.data?.message ||
                updateMutation.error?.message ||
                'Failed to update order status. Please try again.'
              }
            />
          )}

          <div className="space-y-2">
            <label htmlFor="order-status" className="text-sm font-medium">
              Fulfillment Status
            </label>
            <select
              id="order-status"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as OrderStatus)}
              disabled={updateMutation.isPending}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="PENDING">Pending - Processing required</option>
              <option value="PAID">Paid - Payment confirmed</option>
              <option value="SHIPPED">Shipped - Dispatched to customer</option>
              <option value="DELIVERED">
                Delivered - Received by customer
              </option>
              <option value="CANCELLED">Cancelled - Order voided</option>
            </select>
          </div>
        </div>
      </DialogComponent>

      <AlertComponent
        title="Cancel Order"
        description={`Are you sure you want to cancel order #${cancellingOrder?.orderId}?`}
        isAlertDialogOpen={!!cancellingOrder}
        onOpenChange={open => {
          if (!open) {
            setCancellingOrder(null);
            updateMutation.reset();
          }
        }}
        actionText="Confirm Cancel Order"
        loadingText="Cancelling..."
        isDeleting={updateMutation.isPending}
        errorText={updateMutation.error?.response?.data?.message}
        onAction={handleCancelOrder}
      />
    </AdminLayout>
  );
};

export default OrderManagement;
