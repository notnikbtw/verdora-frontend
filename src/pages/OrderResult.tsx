import { useSearchParams, Link, Navigate } from 'react-router-dom';
import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@components/ui/card';
import OrderStatusBadge from '@components/common/Badge/OrderStatusBadge';
import { formatOrderPrice } from '@/utils/order.utils';
import { Skeleton } from '@components/ui/skeleton';
import ErrorSection from '@components/common/section/ErrorSection';
import { useOrderById } from '@api/order/order.hooks';
import { useGetCurrentUser } from '@api/user/user.hooks';
import {
  CheckCircle2,
  ShoppingBag,
  Mail,
  History,
  ShieldCheck,
} from 'lucide-react';

const OrderResult = () => {
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const numericOrderId = orderIdParam ? parseInt(orderIdParam, 10) : 0;

  const {
    data: order,
    isLoading: isOrderLoading,
    error: orderError,
    refetch,
  } = useOrderById(numericOrderId);
  const { data: currentUser } = useGetCurrentUser();

  if (!orderIdParam || isNaN(numericOrderId) || numericOrderId <= 0) {
    return <Navigate to="/" replace />;
  }

  if (orderError) {
    return (
      <LayoutPage>
        <ErrorSection
          title="Order Not Found"
          message={
            orderError.response?.data?.message ||
            'We could not find the details for this order.'
          }
          retryText="Try Again"
          onRetry={() => refetch()}
        />
      </LayoutPage>
    );
  }

  const isGuest = !currentUser;
  const orderNumber = numericOrderId || order?.orderId || 'N/A';
  const orderEmail = currentUser?.email || 'your email';

  return (
    <LayoutPage>
      <div className="max-w-2xl mx-auto py-8">
        {isOrderLoading ? (
          <Card className="p-6 space-y-6">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </Card>
        ) : (
          <Card className="border-emerald-200 bg-emerald-50/20 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-emerald-100 p-4 rounded-full w-fit mb-3">
                <CheckCircle2 className="size-12 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-emerald-950">
                Order Confirmed!
              </CardTitle>
              <p className="text-sm text-emerald-800 mt-1">
                Thank you! Your order has been successfully placed.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="p-4 bg-white border border-emerald-100 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Order Number
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">
                    #{orderNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <OrderStatusBadge status={order?.status || 'CONFIRMED'} />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <Mail className="size-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <p className="font-semibold text-emerald-950">
                    Order Confirmation Sent
                  </p>
                  <p className="mt-0.5">
                    A confirmation email with your order summary and receipt has
                    been sent to{' '}
                    <span className="font-medium underline">{orderEmail}</span>.
                  </p>
                </div>
              </div>

              {order && order.items && order.items.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800">
                    Order Summary
                  </h4>
                  <div className="divide-y border rounded-xl bg-white overflow-hidden text-sm shadow-sm">
                    {order.items.map(item => (
                      <div
                        key={item.orderItemId}
                        className="p-3.5 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} ×{' '}
                            {formatOrderPrice(item.priceAtPurchase)}
                          </p>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatOrderPrice(item.subtotal)}
                        </span>
                      </div>
                    ))}
                    <div className="p-3.5 flex justify-between items-center font-bold text-gray-900 bg-gray-50/50">
                      <span>Total Paid</span>
                      <span className="text-emerald-700">
                        {formatOrderPrice(order.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>Your order details have been securely recorded.</span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="default"
                className="w-full sm:flex-1 py-5 text-sm font-semibold"
                asChild
              >
                <Link to="/">
                  <ShoppingBag className="size-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>

              {!isGuest && (
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 py-5 text-sm font-medium border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                  asChild
                >
                  <Link to="/orders">
                    <History className="size-4 mr-2" />
                    View Order History
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </LayoutPage>
  );
};

export default OrderResult;
