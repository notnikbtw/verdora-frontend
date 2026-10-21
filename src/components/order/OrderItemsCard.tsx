import type { FC } from 'react';
import type { Order } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { formatOrderPrice } from '@/utils/order.utils';
import { Package } from 'lucide-react';

type Props = {
  order: Order;
};

export const OrderItemsCard: FC<Props> = ({ order }) => {
  const items = order.items ?? [];

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              Order Items ({items.length}{' '}
              {items.length === 1 ? 'item' : 'items'})
            </CardTitle>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Standard Currency (USD)
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {items.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No item details available for this order.
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.orderItemId}
                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="size-16 sm:size-20 shrink-0 rounded-xl bg-muted/50 border border-border/80 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="size-full object-cover"
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add(
                            'bg-primary/10',
                            'text-primary'
                          );
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Package className="size-7 text-primary/70" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-foreground truncate">
                      {item.productName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[11px] font-normal px-2 py-0.5 bg-muted text-muted-foreground"
                      >
                        {item.categoryName || 'General'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        SKU #{item.productId}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Unit Price:{' '}
                      <span className="font-medium text-foreground">
                        {formatOrderPrice(item.priceAtPurchase)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="text-xs text-muted-foreground">
                    <span>Quantity:</span>{' '}
                    <strong className="text-foreground text-sm">
                      {item.quantity}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block sm:hidden">
                      Subtotal
                    </span>
                    <span className="font-bold text-base text-foreground">
                      {formatOrderPrice(item.subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-muted/30 p-6 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Prices include all applicable taxes and tariffs.</p>
            <p>Need support? Contact support@verdora.com.</p>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Items Subtotal:</span>
              <span className="font-medium text-foreground">
                {formatOrderPrice(order.totalPrice)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery & Shipping:</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Free
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-foreground border-t border-border pt-2">
              <span>Total Amount:</span>
              <span className="text-primary text-lg font-extrabold">
                {formatOrderPrice(order.totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderItemsCard;
