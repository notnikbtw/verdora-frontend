import type { FC } from 'react';
import type { Order } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { MapPin, Truck, CreditCard } from 'lucide-react';

type Props = {
  order: Order;
};

export const OrderInfoCards: FC<Props> = ({ order }) => {
  const isPaid =
    order.status === 'PAID' ||
    order.status === 'CONFIRMED' ||
    order.status === 'SHIPPED';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center gap-2">
          <MapPin className="size-4 text-primary" />
          <CardTitle className="text-sm font-semibold">
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1 text-muted-foreground">
          <p className="font-semibold text-foreground text-sm">
            Delivery Destination
          </p>
          <p className="leading-relaxed">
            {order.shippingAddress || 'Address specified during checkout'}
          </p>
          <p className="text-[11px] text-muted-foreground pt-1">
            Contact receiver via account phone/email
          </p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3 flex flex-row items-center gap-2">
          <Truck className="size-4 text-primary" />
          <CardTitle className="text-sm font-semibold">
            Delivery Method
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1 text-muted-foreground">
          <p className="font-semibold text-foreground text-sm">
            {order.deliveryMethod || 'Standard Courier Delivery'}
          </p>
          <p className="leading-relaxed">Expected transit: 2–4 business days</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium pt-1">
            Free shipping applied
          </p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3 flex flex-row items-center gap-2">
          <CreditCard className="size-4 text-primary" />
          <CardTitle className="text-sm font-semibold">
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1 text-muted-foreground">
          <p className="font-semibold text-foreground text-sm">
            {order.paymentMethod || 'Online Card Payment'}
          </p>
          <p className="leading-relaxed">
            Transaction: {isPaid ? 'Fully Paid' : 'Pending settlement'}
          </p>
          <p className="text-[11px] text-muted-foreground pt-1">
            Invoice is available for download
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderInfoCards;
