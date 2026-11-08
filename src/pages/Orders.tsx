import { useState, useMemo } from 'react';
import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import { Button } from '@components/ui/button';
import { useAllOrders, useCancelOrder } from '@api/order/order.hooks';
import type { Order } from '@/types/order';
import OrderCard from '@components/common/cards/OrderCard';
import OrderCardSkeleton from '@components/common/cards/OrderCardSkeleton';
import { PaginationComponent } from '@components/common/pagination/Pagination';
import { EmptySection } from '@components/common/section/EmptySection';
import ErrorSection from '@components/common/section/ErrorSection';
import AlertComponent from '@components/common/dialog/AlertComponent';
import NoticeAlert from '@components/common/NoticeAlert';
import { sortOrdersNewestFirst } from '@/utils/order.utils';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ORDERS_PER_PAGE } from '@/config/orders.config';
import CartHeader from '@components/layout/pageComponents/CartHeader';

const Orders = () => {
  const {
    data: apiOrders,
    isLoading,
    isError,
    error,
    refetch,
  } = useAllOrders();

  const cancelMutation = useCancelOrder();

  const [currentPage, setCurrentPage] = useState(0);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [cancelErrorNotice, setCancelErrorNotice] = useState<string | null>(
    null
  );

  const sortedOrders = useMemo(() => {
    return sortOrdersNewestFirst(apiOrders ?? []);
  }, [apiOrders]);

  const totalPages = Math.ceil(sortedOrders.length / ORDERS_PER_PAGE);
  const safeCurrentPage =
    totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

  const paginatedOrders = useMemo(() => {
    const startIndex = safeCurrentPage * ORDERS_PER_PAGE;
    return sortedOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
  }, [sortedOrders, safeCurrentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmCancel = () => {
    if (!cancellingOrder || cancelMutation.isPending) return;
    const targetOrderId = cancellingOrder.orderId;

    cancelMutation.mutate(targetOrderId, {
      onSuccess: () => {
        setCancellingOrder(null);
        setSuccessNotice(
          `Order #${targetOrderId} has been successfully cancelled.`
        );
        setCancelErrorNotice(null);
      },
      onError: err => {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          `Failed to cancel Order #${targetOrderId}. Please try again.`;
        setCancelErrorNotice(errorMsg);
        refetch();
      },
    });
  };

  return (
    <LayoutPage>
      <div className="page-stack">
        <CartHeader
          title="Order History"
          subtitle="Track all your purchases."
        />

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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <OrderCardSkeleton key={index} />
            ))}
          </div>
        ) : isError && !apiOrders ? (
          <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
            <ErrorSection
              title="Unable to load orders"
              message={
                error?.response?.data?.message ||
                error?.message ||
                'We were unable to retrieve your order history. Please check your connection and try again.'
              }
              onRetry={() => refetch()}
              retryText="Try Again"
            />
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 shadow-xs">
            <EmptySection
              title="No orders yet"
              description="You have not placed any orders yet. Explore our green catalog and find something you love!"
              icon={
                <div className="flex items-center justify-center rounded-full bg-primary/10 p-4">
                  <Package
                    className="size-10 text-primary"
                    aria-hidden="true"
                  />
                </div>
              }
              action={
                <Button asChild variant="default">
                  <Link to="/products">Browse Catalog</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                Showing{' '}
                <strong className="text-foreground">
                  {safeCurrentPage * ORDERS_PER_PAGE + 1}
                </strong>{' '}
                to{' '}
                <strong className="text-foreground">
                  {Math.min(
                    (safeCurrentPage + 1) * ORDERS_PER_PAGE,
                    sortedOrders.length
                  )}
                </strong>{' '}
                of{' '}
                <strong className="text-foreground">
                  {sortedOrders.length}
                </strong>{' '}
                orders (Newest first)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedOrders.map(order => (
                <OrderCard
                  key={order.orderId}
                  order={order}
                  isCancelling={
                    cancelMutation.isPending &&
                    cancellingOrder?.orderId === order.orderId
                  }
                  onCancelClick={order => {
                    setCancelErrorNotice(null);
                    cancelMutation.reset();
                    setCancellingOrder(order);
                  }}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pt-4 flex justify-center">
                <PaginationComponent
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}

        <AlertComponent
          title="Cancel Order"
          description={`Are you sure you want to cancel order #${cancellingOrder?.orderId}? This will stop your order from being processed.`}
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
          onAction={handleConfirmCancel}
        />
      </div>
    </LayoutPage>
  );
};

export default Orders;
