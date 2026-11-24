import type { Order } from '@/types/order';
import { formatCurrency, getOrderItemsTotal } from '@/utils/order.utils';

const OrderPriceBreakdown = ({ order }: { order: Order }) => (
  <dl className="space-y-2 text-sm">
    <div className="flex justify-between gap-3 text-muted-foreground">
      <dt>Items subtotal</dt>
      <dd className="shrink-0 font-medium text-foreground">
        {formatCurrency(getOrderItemsTotal(order))}
      </dd>
    </div>
    <div className="flex justify-between gap-3 text-muted-foreground">
      <dt>Delivery</dt>
      <dd className="shrink-0 font-medium text-foreground">
        {formatCurrency(order.shippingCost, 'Not available')}
      </dd>
    </div>
    <div className="flex justify-between gap-3 border-t border-border pt-2 text-base font-bold">
      <dt>Total amount</dt>
      <dd className="shrink-0 text-primary">
        {formatCurrency(order.totalPrice)}
      </dd>
    </div>
  </dl>
);

export default OrderPriceBreakdown;
