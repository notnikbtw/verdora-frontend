import React from 'react';
import { Link } from 'react-router-dom';
import type { Order, OrderCustomer } from '@/types/order';
import DialogComponent from '@components/common/dialog/DialogComponent';
import OrderStatusBadge from '@/components/common/badge/OrderStatusBadge';
import ErrorSection from '@components/common/section/ErrorSection';
import { Skeleton } from '@components/ui/skeleton';
import { Button } from '@components/ui/button';
import { ExternalLink, Download, Pencil } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import {
  formatOrderDate,
  formatOrderPrice,
  isOrderCancellable,
  printOrderInvoice,
} from '@/utils/order.utils';

type OrderDetailsDialogProps = {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelClick?: (order: Order) => void;
  onEditStatus?: (order: Order) => void;
  showInvoice?: boolean;
  showFullPageLink?: boolean;
  isCancelling?: boolean;
  isLoading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  customer?: OrderCustomer;
};

export const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  open,
  onOpenChange,
  onCancelClick,
  onEditStatus,
  showInvoice = true,
  showFullPageLink = true,
  isCancelling = false,
  isLoading = false,
  errorMessage,
  onRetry,
  customer,
}) => {
  if (!order) {
    if (!open) return null;
    return (
      <DialogComponent
        open={open}
        onOpenChange={onOpenChange}
        headerTitle="Order details"
        cancelText="Close"
        contentClassName="w-[calc(100%-2rem)] sm:max-w-3xl"
      >
        {isLoading ? (
          <div
            role="status"
            aria-label="Loading order details"
            className="space-y-3 py-2"
          >
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <ErrorSection
            title="Unable to load order details"
            message={errorMessage || 'Order details are unavailable.'}
            onRetry={onRetry}
            retryText="Try again"
          />
        )}
      </DialogComponent>
    );
  }

  const cancellable = isOrderCancellable(order.status);
  const items = order.items ?? [];

  return (
    <DialogComponent
      open={open}
      onOpenChange={onOpenChange}
      headerTitle={`Order #${order.orderId} Details`}
      headerDescription={`Placed on ${formatOrderDate(order.createdAt)}`}
      contentClassName="w-[calc(100%-2rem)] sm:max-w-3xl"
      cancelText="Close"
      thirdActionText={
        cancellable && onCancelClick ? 'Cancel Order' : undefined
      }
      thirdActionDisabled={!cancellable || isCancelling}
      onThirdAction={() => {
        onCancelClick?.(order);
      }}
    >
      <div className="min-w-0 space-y-4 py-2">
        {customer && (
          <div className="rounded-lg border border-border p-3 text-sm wrap-anywhere">
            <p className="font-semibold">{customer.name}</p>
            <p className="text-muted-foreground">{customer.email}</p>
            {customer.phone && (
              <p className="text-muted-foreground">{customer.phone}</p>
            )}
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between p-3 rounded-lg bg-muted/40 border border-border">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Order Status:</span>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {onEditStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditStatus(order)}
                className="min-h-11 sm:min-h-8 px-2 text-xs gap-1 cursor-pointer"
                title="Change order status"
              >
                <Pencil className="size-3 mr-1" />
                <span>Change Status</span>
              </Button>
            )}

            {showInvoice && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => printOrderInvoice(order)}
                className="min-h-11 sm:min-h-8 px-2 text-xs gap-1 cursor-pointer"
                title="Download or print invoice"
              >
                <Download className="size-3" />
                <span>Invoice</span>
              </Button>
            )}

            {showFullPageLink && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="min-h-11 sm:min-h-8 px-2 text-xs gap-1"
              >
                <Link to={`/orders/${order.orderId}`}>
                  <span>Full Page</span>
                  <ExternalLink className="size-3" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3 sm:hidden">
          {items.length === 0 ? (
            <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
              No item details available.
            </p>
          ) : (
            items.map(item => (
              <div
                key={item.orderItemId}
                className="min-w-0 rounded-lg border border-border p-3 space-y-3"
              >
                <p className="wrap-anywhere text-sm font-medium">
                  {item.productName}
                </p>
                <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Quantity</dt>
                  <dd className="text-right">{item.quantity}</dd>
                  <dt className="text-muted-foreground">Unit Price</dt>
                  <dd className="text-right">
                    {formatOrderPrice(item.priceAtPurchase)}
                  </dd>
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="text-right font-semibold">
                    {formatOrderPrice(item.subtotal)}
                  </dd>
                </dl>
              </div>
            ))
          )}
        </div>

        <div className="hidden sm:block min-w-0 max-w-full rounded-md border border-border">
          <Table
            className="table-fixed"
            containerClassName="min-w-0 rounded-md"
          >
            <colgroup>
              <col />
              <col className="w-14" />
              <col className="w-24" />
              <col className="w-24" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs">Product</TableHead>
                <TableHead className="text-center text-xs">Qty</TableHead>
                <TableHead className="text-right text-xs">Unit Price</TableHead>
                <TableHead className="text-right text-xs">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-sm text-muted-foreground py-6"
                  >
                    No item details available.
                  </TableCell>
                </TableRow>
              ) : (
                items.map(item => (
                  <TableRow key={item.orderItemId}>
                    <TableCell className="whitespace-normal wrap-anywhere text-sm font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatOrderPrice(item.priceAtPurchase)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatOrderPrice(item.subtotal)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-border">
          <span className="font-semibold text-base">Total Amount:</span>
          <span className="whitespace-nowrap font-bold text-lg text-primary">
            {formatOrderPrice(order.totalPrice)}
          </span>
        </div>
      </div>
    </DialogComponent>
  );
};

export default OrderDetailsDialog;
