import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Package, XCircle, Eye, Loader2, ArrowRight } from 'lucide-react';
import type { Order } from '@/types/order';
import OrderStatusBadge from '@/components/common/badge/OrderStatusBadge';
import {
  formatOrderDate,
  formatOrderPrice,
  isOrderCancellable,
} from '@/utils/order.utils';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export interface OrderCardProps {
  order: Order;
  onCancelClick?: (order: Order) => void;
  onViewDetails?: (order: Order) => void;
  onClick?: (order: Order) => void;
  isCancelling?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onCancelClick,
  onViewDetails,
  onClick,
  isCancelling = false,
}) => {
  const navigate = useNavigate();
  const cancellable = isOrderCancellable(order.status);
  const formattedDate = formatOrderDate(order.createdAt);
  const totalAmount = formatOrderPrice(order.totalPrice);
  const items = order.items ?? [];
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCardClick = () => {
    if (onClick) {
      onClick(order);
    } else {
      navigate(`/orders/${order.orderId}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.target === e.currentTarget) {
        e.preventDefault();
        handleCardClick();
      }
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="flex flex-col h-full bg-card border-border hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 select-none sm:select-auto"
      aria-label={`Order #${order.orderId}, status ${order.status}. Click to view details.`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                Order #{order.orderId}
              </CardTitle>
              <ArrowRight className="size-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              {formattedDate}
            </CardDescription>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5 border border-border/50 text-sm group-hover:bg-muted/60 transition-colors">
          <div className="flex items-center gap-2 font-medium">
            <Package
              className="size-4 text-primary shrink-0"
              aria-hidden="true"
            />
            <span>
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground mr-1.5">Total:</span>
            <span className="font-bold text-base text-foreground">
              {totalAmount}
            </span>
          </div>
        </div>

        <ul className="text-sm space-y-2 border-t border-border/40 pt-3">
          {items.slice(0, 3).map(item => (
            <li
              key={item.orderItemId}
              className="flex justify-between items-center gap-2 text-xs"
            >
              <span className="flex-1 truncate">
                <span className="font-semibold text-muted-foreground mr-1.5">
                  {item.quantity}×
                </span>
                <span className="text-foreground">{item.productName}</span>
              </span>
              <span className="font-medium text-foreground whitespace-nowrap">
                {formatOrderPrice(item.subtotal)}
              </span>
            </li>
          ))}
          {items.length > 3 && (
            <li className="text-xs text-muted-foreground pt-0.5">
              + {items.length - 3} more item
              {items.length - 3 > 1 ? 's' : ''}...
            </li>
          )}
        </ul>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 pt-3 border-t border-border bg-muted/20">
        {onViewDetails ? (
          <Button
            variant="outline"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              onViewDetails(order);
            }}
            className="text-xs cursor-pointer gap-1.5"
            aria-label={`View details for order #${order.orderId}`}
          >
            <Eye className="size-3.5" aria-hidden="true" />
            <span>Details</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            asChild
            onClick={e => e.stopPropagation()}
            className="text-xs cursor-pointer gap-1.5 hover:border-primary/50"
            aria-label={`View details for order #${order.orderId}`}
          >
            <Link to={`/orders/${order.orderId}`}>
              <Eye className="size-3.5" aria-hidden="true" />
              <span>Details</span>
            </Link>
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant={cancellable ? 'destructive' : 'secondary'}
            size="sm"
            disabled={!cancellable || isCancelling}
            onClick={e => {
              e.stopPropagation();
              onCancelClick?.(order);
            }}
            className="text-xs cursor-pointer gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              cancellable
                ? 'Cancel this order'
                : 'Cancellation is only available for orders with Pending payment or Confirmed status'
            }
            aria-label={`Cancel order #${order.orderId}`}
          >
            {isCancelling ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <XCircle className="size-3.5" aria-hidden="true" />
            )}
            <span>{isCancelling ? 'Cancelling...' : 'Cancel Order'}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OrderCard;
