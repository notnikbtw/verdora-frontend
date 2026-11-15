import { useState, useMemo } from 'react';
import AdminLayout from '@components/layout/pageLayout/AdminLayout';
import AdminSectionHeader from '@components/common/section/AdminSectionHeader';
import { Button } from '@components/ui/button';
import OrderStatusBadge from '@/components/common/badge/OrderStatusBadge';
import { formatOrderDate, formatOrderPrice } from '@/utils/order.utils';
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
  useAllOrders,
  useUpdateOrder,
  useCancelOrder,
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

const OrderManagement = () => {
  const {
    data: apiOrders,
    isLoading: ordersLoading,
    isError,
    error: ordersError,
    refetch: refetchOrders,
    isRefetching,
  } = useAllOrders();

  const updateMutation = useUpdateOrder();
  const cancelMutation = useCancelOrder();

  const [selectedOrderDetails, setSelectedOrderDetails] =
    useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING');
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);

  const metrics = useMemo(() => {
    return {
      total: apiOrders?.length,
      pending: apiOrders?.filter(o => o.status === 'PENDING').length,
      paid: apiOrders?.filter(o => o.status === 'PAID').length,
      shipped: apiOrders?.filter(o => o.status === 'SHIPPED').length,
      cancelled: apiOrders?.filter(o => o.status === 'CANCELLED').length,
    };
  }, [apiOrders]);

  const handleUpdateStatus = () => {
    if (!editingOrder) return;
    const targetId = editingOrder.orderId;
    const newStatus = selectedStatus;

    updateMutation.mutate(
      { orderId: targetId, status: newStatus },
      {
        onSuccess: () => {
          setEditingOrder(null);

          if (selectedOrderDetails?.orderId === targetId) {
            setSelectedOrderDetails(prev =>
              prev ? { ...prev, status: newStatus } : null
            );
          }
        },
      }
    );
  };

  const handleCancelOrder = () => {
    if (!cancellingOrder) return;
    const targetId = cancellingOrder.orderId;

    cancelMutation.mutate(targetId, {
      onSuccess: () => {
        setCancellingOrder(null);

        if (selectedOrderDetails?.orderId === targetId) {
          setSelectedOrderDetails(prev =>
            prev ? { ...prev, status: 'CANCELLED' } : null
          );
        }
      },
    });
  };

  const formatDate = (dateStr: string) => formatOrderDate(dateStr);

  return (
    <AdminLayout>
      <AdminSectionHeader
        title="Order Management"
        count={apiOrders?.length}
        description="Monitor, process, and update customer orders across your catalog."
      >
        <Button
          variant="outline"
          onClick={() => refetchOrders()}
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
        {ordersLoading ? (
          <>
            <DashboardMetricCardSkeleton />
            <DashboardMetricCardSkeleton />
            <DashboardMetricCardSkeleton />
            <DashboardMetricCardSkeleton />
            <DashboardMetricCardSkeleton />
          </>
        ) : (
          <>
            <DashboardMetricCard
              value={metrics?.total?.toString() ?? 'N/A'}
              title="Total Orders"
              description="All recorded orders"
              icon={Package}
              error={isError}
              errorMessage="Failed to load orders. Please try again later."
            />
            <DashboardMetricCard
              value={metrics?.pending?.toString() ?? 'N/A'}
              title="Pending"
              description="Awaiting processing"
              icon={Clock}
              error={isError}
              errorMessage="Failed to load orders. Please try again later."
            />
            <DashboardMetricCard
              value={metrics?.paid?.toString() ?? 'N/A'}
              title="Paid"
              description="Payment received"
              icon={CheckCircle2}
              error={isError}
              errorMessage="Failed to load orders. Please try again later."
            />
            <DashboardMetricCard
              value={metrics?.shipped?.toString() ?? 'N/A'}
              title="Shipped"
              description="In transit / fulfilled"
              icon={Truck}
              error={isError}
              errorMessage="Failed to load orders. Please try again later."
            />
            <DashboardMetricCard
              value={metrics?.cancelled?.toString() ?? 'N/A'}
              title="Cancelled"
              description="Voided orders"
              icon={XCircle}
              error={isError}
              errorMessage="Failed to load orders. Please try again later."
            />
          </>
        )}
      </div>

      <div className="mt-6">
        {ordersLoading ? (
          <Card className="border-border shadow-sm p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </Card>
        ) : isError ? (
          <Card className="border-border py-8">
            <ErrorSection
              title="Failed to load orders"
              message={
                ordersError?.response?.data?.message ||
                ordersError?.message ||
                'Something went wrong while fetching orders. Please try again.'
              }
              onRetry={() => refetchOrders()}
              retryText="Try again"
            />
          </Card>
        ) : !apiOrders || apiOrders.length === 0 ? (
          <EmptySection
            title="No orders found"
            description="There are no customer orders recorded in the system yet."
            className="rounded-xl border border-dashed border-border bg-card px-6 py-12"
            icon={
              <div className="flex items-center justify-center rounded-full bg-primary/10 p-4">
                <Package className="size-8 text-primary" aria-hidden="true" />
              </div>
            }
          />
        ) : (
          <Card className="border-border shadow-sm">
            <CardHeader className="py-4 px-6 border-b">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base">Order Records</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Showing {apiOrders.length} orders
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-25 pl-6">Order ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Items Overview</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiOrders.map(order => (
                    <TableRow key={order.orderId} className="hover:bg-muted/30">
                      <TableCell className="font-semibold text-foreground pl-6">
                        #{order.orderId}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-70">
                          <p className="text-sm font-medium truncate">
                            {order.items[0]?.productName || 'Order items'}
                          </p>
                          {order.items.length > 1 && (
                            <p className="text-xs text-muted-foreground">
                              +{order.items.length - 1} other item
                              {order.items.length - 1 > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium text-xs">
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
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
                            onClick={() => setSelectedOrderDetails(order)}
                            className="cursor-pointer h-8 px-2 text-xs"
                            title="View order details"
                          >
                            <Eye className="size-3.5 mr-1" />
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateMutation.reset();
                              setEditingOrder(order);
                              setSelectedStatus(order.status);
                            }}
                            className="cursor-pointer h-8 px-2 text-xs"
                            title="Edit order status"
                          >
                            <Pencil className="size-3.5 mr-1" />
                            Status
                          </Button>
                          {order.status !== 'CANCELLED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCancellingOrder(order)}
                              className="cursor-pointer h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
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
            </CardContent>
          </Card>
        )}
      </div>

      <OrderDetailsDialog
        order={selectedOrderDetails}
        open={!!selectedOrderDetails}
        showFullPageLink={false}
        onOpenChange={open => {
          if (!open) setSelectedOrderDetails(null);
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
            <label className="text-sm font-medium">Fulfillment Status</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as OrderStatus)}
              disabled={updateMutation.isPending}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="PENDING">Pending - Processing required</option>
              <option value="PAID">Paid - Payment confirmed</option>
              <option value="SHIPPED">Shipped - Dispatched to customer</option>
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
            cancelMutation.reset();
          }
        }}
        actionText="Confirm Cancel Order"
        loadingText="Cancelling..."
        isDeleting={cancelMutation.isPending}
        errorText={cancelMutation.error?.response?.data?.message}
        onAction={handleCancelOrder}
      />
    </AdminLayout>
  );
};

export default OrderManagement;
