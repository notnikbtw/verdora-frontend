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
        contentClassName="sm:max-w-xl"
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
      contentClassName="sm:max-w-xl"
      cancelText="Close"
      thirdActionText={
        cancellable && onCancelClick ? 'Cancel Order' : undefined
      }
      thirdActionDisabled={!cancellable || isCancelling}
      onThirdAction={() => {
        onCancelClick?.(order);
      }}
    >
      <div className="space-y-4 py-2">
        {customer && (
          <div className="rounded-lg border border-border p-3 text-sm wrap-anywhere">
            <p className="font-semibold">{customer.name}</p>
            <p className="text-muted-foreground">{customer.email}</p>
            {customer.phone && (
              <p className="text-muted-foreground">{customer.phone}</p>
            )}
          </div>
        )}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Order Status:</span>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="flex items-center gap-2">
            {onEditStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditStatus(order)}
                className="h-7 px-2 text-xs gap-1 cursor-pointer"
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
                className="h-7 px-2 text-xs gap-1 cursor-pointer"
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
                className="h-7 px-2 text-xs gap-1"
              >
                <Link to={`/orders/${order.orderId}`}>
                  <span>Full Page</span>
                  <ExternalLink className="size-3" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-md border border-border overflow-hidden">
          <Table>
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
                    <TableCell className="text-sm font-medium">
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

        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="font-semibold text-base">Total Amount:</span>
          <span className="font-bold text-lg text-primary">
            {formatOrderPrice(order.totalPrice)}
          </span>
        </div>
      </div>
    </DialogComponent>
  );
};

export default OrderDetailsDialog;
