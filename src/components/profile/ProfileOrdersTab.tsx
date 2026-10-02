import { useState, useMemo } from 'react';
import { Button } from '@components/ui/button';
import { useAllOrders, useCancelOrder } from '@api/order/order.hooks';
import type { Order } from '@/types/order';
import OrderCard from '@components/common/cards/OrderCard';
import OrderCardSkeleton from '@components/common/cards/OrderCardSkeleton';
import { PaginationComponent } from '@components/common/pagination/Pagination';
import { EmptySection } from '@components/common/section/EmptySection';
import ErrorSection from '@components/common/section/ErrorSection';
import AlertComponent from '@components/common/dialog/AlertComponent';
import { OrderDetailsDialog } from '@components/common/dialog/OrderDetailsDialog';
import NoticeAlert from '@components/common/NoticeAlert';
import { sortOrdersNewestFirst } from '@/utils/order.utils';
import { ShoppingBag, Package, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const ORDERS_PER_PAGE = 8;

export const ProfileOrdersTab = () => {
  const {
    data: apiOrders,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useAllOrders();

  const cancelMutation = useCancelOrder();

  const [currentPage, setCurrentPage] = useState(0);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);
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
  };

  const handleConfirmCancel = () => {
    if (!cancellingOrder || cancelMutation.isPending) return;
    const targetOrderId = cancellingOrder.orderId;

    cancelMutation.mutate(targetOrderId, {
      onSuccess: () => {
        setCancellingOrder(null);
        if (detailsOrder?.orderId === targetOrderId) {
          setDetailsOrder(null);
        }
        setSuccessNotice(
          `Order #${targetOrderId} has been successfully cancelled.`
        );
        setCancelErrorNotice(null);
      },
      onError: () => {
        refetch();
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#EDF5E9] text-[#2F6B29]">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                Order History
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Track, review, and manage all your past and current purchases.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {sortedOrders.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-[#EDF5E9] px-3 py-1 text-xs font-semibold text-[#2F6B29]">
                {sortedOrders.length}{' '}
                {sortedOrders.length === 1 ? 'order' : 'orders'}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching || isLoading}
              className="cursor-pointer gap-2 text-xs rounded-xl"
              title="Refresh order history"
            >
              <RefreshCw
                className={`size-3.5 ${isRefetching ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </Button>
          </div>
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

      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <OrderCardSkeleton key={index} />
          ))}
        </div>
      ) : isError && !apiOrders ? (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
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
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center shadow-xs">
          <EmptySection
            title="No orders yet"
            description="You have not placed any orders yet. Explore our green catalog and find something you love!"
            icon={
              <div className="flex items-center justify-center rounded-full bg-[#EDF5E9] p-4 text-[#2F6B29]">
                <Package className="size-10" aria-hidden="true" />
              </div>
            }
            action={
              <Button asChild variant="default" className="rounded-xl">
                <Link to="/catalog">Browse Catalog</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Showing{' '}
              <strong className="text-zinc-900">
                {safeCurrentPage * ORDERS_PER_PAGE + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-zinc-900">
                {Math.min(
                  (safeCurrentPage + 1) * ORDERS_PER_PAGE,
                  sortedOrders.length
                )}
              </strong>{' '}
              of{' '}
              <strong className="text-zinc-900">{sortedOrders.length}</strong>{' '}
              orders
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {paginatedOrders.map(order => (
              <OrderCard
                key={order.orderId}
                order={order}
                isCancelling={
                  cancelMutation.isPending &&
                  cancellingOrder?.orderId === order.orderId
                }
                onViewDetails={ord => setDetailsOrder(ord)}
                onCancelClick={ord => {
                  setCancelErrorNotice(null);
                  cancelMutation.reset();
                  setCancellingOrder(ord);
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

      <OrderDetailsDialog
        order={detailsOrder}
        open={!!detailsOrder}
        onOpenChange={open => {
          if (!open) setDetailsOrder(null);
        }}
        onCancelClick={ord => {
          setCancelErrorNotice(null);
          cancelMutation.reset();
          setCancellingOrder(ord);
        }}
      />
    </div>
  );
};

export default ProfileOrdersTab;
