import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import { Button } from '@components/ui/button';
import OrderStatusBadge from '@components/common/Badge/OrderStatusBadge';
import AlertComponent from '@components/common/dialog/AlertComponent';
import NoticeAlert from '@components/common/NoticeAlert';
import ErrorSection from '@components/common/section/ErrorSection';
import OrderDetailsSkeleton from '@components/order/OrderDetailsSkeleton';
import OrderJourneyTimeline from '@components/order/OrderJourneyTimeline';
import OrderTrackingCard from '@components/order/OrderTrackingCard';
import OrderInfoCards from '@components/order/OrderInfoCards';
import OrderItemsCard from '@components/order/OrderItemsCard';
import { useOrderById, useCancelOrder } from '@api/order/order.hooks';
import {
  formatOrderDate,
  isOrderCancellable,
  printOrderInvoice,
} from '@/utils/order.utils';
import { ArrowLeft, Download, XCircle, Loader2 } from 'lucide-react';

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const numericOrderId = Number(orderId);

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrderById(numericOrderId);

  const cancelMutation = useCancelOrder();
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [cancelErrorNotice, setCancelErrorNotice] = useState<string | null>(
    null
  );

  const handleConfirmCancel = () => {
    if (!order || cancelMutation.isPending) return;

    cancelMutation.mutate(order.orderId, {
      onSuccess: () => {
        setIsCancelAlertOpen(false);
        setSuccessNotice(
          `Order #${order.orderId} has been successfully cancelled.`
        );
        setCancelErrorNotice(null);
        refetch();
      },
      onError: err => {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          `Failed to cancel Order #${order.orderId}. Please try again.`;
        setCancelErrorNotice(errorMsg);
        refetch();
      },
    });
  };

  if (isNaN(numericOrderId) || numericOrderId <= 0) {
    return (
      <LayoutPage>
        <div className="w-full py-12">
          <ErrorSection
            title="Invalid Order ID"
            message="The specified order number is invalid. Please check the URL and try again."
            retryText="Back to Orders"
            onRetry={() => navigate('/orders')}
          />
        </div>
      </LayoutPage>
    );
  }

  return (
    <LayoutPage>
      <div className="w-full">
        <div className="py-6 space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              to="/orders"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Orders</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              Order #{numericOrderId}
            </span>
          </div>

          {isLoading ? (
            <OrderDetailsSkeleton />
          ) : isError && !order ? (
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs my-6">
              <ErrorSection
                title="Unable to load order details"
                message={
                  error?.response?.data?.message ||
                  error?.message ||
                  `We could not find order #${numericOrderId}. It may not exist or you might not have access to it.`
                }
                onRetry={() => refetch()}
                retryText="Try Again"
              />
              <div className="mt-4 flex justify-center">
                <Button variant="outline" asChild>
                  <Link to="/orders">Return to Orders History</Link>
                </Button>
              </div>
            </div>
          ) : !order ? (
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs my-6">
              <ErrorSection
                title="Order Not Found"
                message={`We could not find order #${numericOrderId}. It may not exist.`}
                onRetry={() => refetch()}
                retryText="Try Again"
              />
            </div>
          ) : (
            (() => {
              const cancellable = isOrderCancellable(order.status);

              return (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                          Order #{order.orderId}
                        </h1>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Placed on {formatOrderDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printOrderInvoice(order)}
                        className="cursor-pointer gap-2 text-xs"
                        title="Download or print invoice receipt"
                      >
                        <Download className="size-4" />
                        <span>Download Receipt</span>
                      </Button>

                      <Button
                        variant={cancellable ? 'destructive' : 'secondary'}
                        size="sm"
                        onClick={() => {
                          setCancelErrorNotice(null);
                          cancelMutation.reset();
                          setIsCancelAlertOpen(true);
                        }}
                        disabled={!cancellable || cancelMutation.isPending}
                        className="cursor-pointer gap-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          cancellable
                            ? 'Cancel this order'
                            : 'Cancellation is only available for orders with Pending payment or Confirmed status'
                        }
                        aria-label={`Cancel order #${order.orderId}`}
                      >
                        {cancelMutation.isPending ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <XCircle className="size-3.5" />
                        )}
                        <span>Cancel Order</span>
                      </Button>
                    </div>
                  </div>

                  {successNotice && (
                    <NoticeAlert
                      variant="success"
                      message={successNotice}
                      onDismiss={() => setSuccessNotice(null)}
                    />
                  )}

                  {cancelErrorNotice && (
                    <NoticeAlert
                      variant="error"
                      message={cancelErrorNotice}
                      onDismiss={() => setCancelErrorNotice(null)}
                    />
                  )}

                  <OrderJourneyTimeline order={order} />
                  <OrderTrackingCard order={order} />
                  <OrderInfoCards order={order} />
                  <OrderItemsCard order={order} />

                  <div className="pt-2 flex justify-between items-center">
                    <Button variant="outline" asChild>
                      <Link to="/orders" className="gap-2">
                        <ArrowLeft className="size-4" />
                        <span>Back to Orders List</span>
                      </Link>
                    </Button>

                    <Button
                      variant="default"
                      onClick={() => printOrderInvoice(order)}
                      className="gap-2 cursor-pointer"
                    >
                      <Download className="size-4" />
                      <span>Download Invoice</span>
                    </Button>
                  </div>
                </div>
              );
            })()
          )}

          <AlertComponent
            title="Cancel Order"
            description={`Are you sure you want to cancel order #${order?.orderId}? This cannot be undone.`}
            isAlertDialogOpen={isCancelAlertOpen}
            onOpenChange={open => {
              if (!open) {
                setIsCancelAlertOpen(false);
                cancelMutation.reset();
              }
            }}
            actionText="Confirm Cancel Order"
            loadingText="Cancelling..."
            isDeleting={cancelMutation.isPending}
            errorText={cancelMutation.error?.response?.data?.message}
            onAction={handleConfirmCancel}
          />
        </div>
      </div>
    </LayoutPage>
  );
};

export default OrderDetails;
