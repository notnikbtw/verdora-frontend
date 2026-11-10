import type { FC } from 'react';
import type { Order } from '@/types/order';
import { Card, CardContent } from '@components/ui/card';
import { formatOrderDate, getEstimatedDeliveryDate } from '@/utils/order.utils';
import { Check, Truck, XCircle } from 'lucide-react';

type Props = {
  order: Order;
};

export const OrderJourneyTimeline: FC<Props> = ({ order }) => {
  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';
  const isShipped =
    order.status === 'SHIPPED' || order.status === 'IN_TRANSIT' || isDelivered;
  const isConfirmed =
    order.status === 'PAID' || order.status === 'CONFIRMED' || isShipped;
  const estimatedDelivery = getEstimatedDeliveryDate(order);

  return (
    <Card className="border-border">
      <CardContent className="p-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Order Journey
        </h2>

        {isCancelled ? (
          <div className="flex items-center gap-3 rounded-lg bg-rose-50 border border-rose-200 p-4 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
            <XCircle className="size-6 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold">Order Cancelled</h4>
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
                This order was cancelled and will not be processed or shipped.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                <Check className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Order Placed
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatOrderDate(order.createdAt, false)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full font-bold text-xs ${
                  isConfirmed
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isConfirmed ? <Check className="size-4" /> : '2'}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Confirmed & Paid
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isConfirmed ? 'Ready for packing' : 'Awaiting confirmation'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full font-bold text-xs ${
                  isDelivered
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : isShipped
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDelivered ? (
                  <Check className="size-4" />
                ) : isShipped ? (
                  <Truck className="size-4" />
                ) : (
                  '3'
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  In Transit
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isDelivered
                    ? 'Delivered to recipient'
                    : isShipped
                      ? 'In transit'
                      : 'In fulfillment'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full font-bold text-xs ${
                  isDelivered
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDelivered ? <Check className="size-4" /> : '4'}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {isDelivered ? 'Delivered' : 'Delivery'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isDelivered
                    ? 'Successfully delivered'
                    : `Est: ${estimatedDelivery}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderJourneyTimeline;
