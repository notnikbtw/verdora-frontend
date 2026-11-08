import { useState, type FC } from 'react';
import type { Order } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import {
  getOrderTrackingInfo,
  getEstimatedDeliveryDate,
} from '@/utils/order.utils';
import { Truck, Calendar, Copy, Check, ExternalLink } from 'lucide-react';

type Props = {
  order: Order;
};

export const OrderTrackingCard: FC<Props> = ({ order }) => {
  const [copiedTracking, setCopiedTracking] = useState(false);
  const tracking = getOrderTrackingInfo(order);
  const estimatedDelivery = getEstimatedDeliveryDate(order);
  const isShipped = order.status === 'SHIPPED';

  const handleCopyTracking = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              Delivery & Tracking Information
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5 text-primary" />
            <span>
              Expected Delivery:{' '}
              <strong className="text-foreground">{estimatedDelivery}</strong>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Carrier & Service
            </span>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                {tracking.carrier}
              </p>
              <Badge variant="outline" className="text-[11px]">
                {order.deliveryMethod || 'Express Delivery'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isShipped
                ? 'Your order has been dispatched and is currently on its way to your destination.'
                : 'Tracking details will activate as soon as the courier scans your package.'}
            </p>
          </div>

          <div className="space-y-2 bg-muted/40 p-4 rounded-xl border border-border">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Tracking Number
            </span>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono font-bold text-foreground">
                {tracking.trackingNumber}
              </code>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyTracking(tracking.trackingNumber)}
                  className="h-8 px-2 text-xs gap-1 cursor-pointer"
                  title="Copy tracking number"
                >
                  {copiedTracking ? (
                    <>
                      <Check className="size-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">
                        Copied
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
                >
                  <a
                    href={tracking.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Track</span>
                    <ExternalLink className="size-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderTrackingCard;
