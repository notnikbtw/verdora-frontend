import { Badge } from '@components/ui/badge';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/order';
import { getOrderStatusLabel } from '@/utils/order.utils';
import { Clock, CheckCircle2, Truck, XCircle, HelpCircle } from 'lucide-react';
import React from 'react';

type OrderStatusBadgeProps = {
  status: OrderStatus | string;
  className?: string;
  showIcon?: boolean;
  format?: 'label' | 'raw';
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
  format = 'label',
}) => {
  const normalizedStatus = (status || '').trim().toUpperCase();

  const isPending =
    normalizedStatus === 'PENDING' ||
    normalizedStatus === 'PENDING_PAYMENT' ||
    normalizedStatus === 'PROCESSING';
  const isConfirmed =
    normalizedStatus === 'PAID' || normalizedStatus === 'CONFIRMED';
  const isShipped =
    normalizedStatus === 'SHIPPED' || normalizedStatus === 'IN_TRANSIT';
  const isDelivered =
    normalizedStatus === 'DELIVERED' || normalizedStatus === 'COMPLETED';
  const isCancelled = normalizedStatus === 'CANCELLED';

  const label = format === 'label' ? getOrderStatusLabel(status) : status;

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 font-medium px-2.5 py-1 text-xs rounded-full border shadow-2xs transition-colors',
        {
          'text-amber-800 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800':
            isPending,
          'text-sky-800 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800':
            isConfirmed,
          'text-blue-800 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800':
            isShipped,
          'text-emerald-800 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800':
            isDelivered,
          'text-rose-800 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800':
            isCancelled,
          'text-muted-foreground bg-muted border-border':
            !isPending &&
            !isConfirmed &&
            !isShipped &&
            !isDelivered &&
            !isCancelled,
        },
        className
      )}
    >
      {showIcon && (
        <>
          {isPending && (
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
          )}
          {isConfirmed && (
            <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
          )}
          {isShipped && (
            <Truck className="size-3.5 shrink-0" aria-hidden="true" />
          )}
          {isDelivered && (
            <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
          )}
          {isCancelled && (
            <XCircle className="size-3.5 shrink-0" aria-hidden="true" />
          )}
          {!isPending &&
            !isConfirmed &&
            !isShipped &&
            !isDelivered &&
            !isCancelled && (
              <HelpCircle className="size-3.5 shrink-0" aria-hidden="true" />
            )}
        </>
      )}
      <span>{label}</span>
    </Badge>
  );
};

export default OrderStatusBadge;
