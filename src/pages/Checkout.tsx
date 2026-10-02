import { useState, useEffect, useRef, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Separator } from '@components/ui/separator';
import { Skeleton } from '@components/ui/skeleton';
import ErrorSection from '@components/common/section/ErrorSection';
import CartHeader from '@components/layout/pageComponents/CartHeader';
import TextField from '@components/common/forms/TextField';
import OrderSummary from '@components/common/cards/OrderSummary';
import NoticeAlert from '@components/common/NoticeAlert';
import { formatCurrency } from '@/utils/order.utils';
import { useGetCart } from '@api/cart/cart.hooks';
import { useCreateOrder } from '@api/order/order.hooks';
import { useGetCurrentUser } from '@api/user/user.hooks';
import { useCheckoutForm } from '@hooks/useCheckoutForm';
import type { CheckoutFormData } from '@/schemas/checkout.schema';
import { rateLimit } from '@/utils/rateLimit';
import { Truck, User, Mail, Phone, RotateCcw } from 'lucide-react';
import DeliveryMethodSelector from '@components/checkout/DeliveryMethodSelector';
import DeliveryAddressForm from '@components/checkout/DeliveryAddressForm';
import PickupLocationSelector from '@components/checkout/PickupLocationSelector';

const PICKUP_LOCATIONS = [
  {
    id: 'kyiv-1',
    name: 'Kyiv Central Store',
    address: 'Khreshchatyk St, 15, Kyiv',
  },
  {
    id: 'lviv-1',
    name: 'Lviv Flagship Store',
    address: 'Svobody Ave, 28, Lviv',
  },
  {
    id: 'odesa-1',
    name: 'Odesa Coastal Branch',
    address: 'Deribasivska St, 10, Odesa',
  },
];

const Checkout = () => {
  const navigate = useNavigate();
  const {
    data: cart,
    isLoading: isCartLoading,
    error: cartError,
    refetch,
  } = useGetCart();
  const { data: currentUser } = useGetCurrentUser();
  const createOrderMutation = useCreateOrder();

  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | undefined>(undefined);
  const isPreFilledRef = useRef(false);
  const canSubmit = useMemo(() => rateLimit(2000), []);

  const {
    handleSubmit,
    formState: { errors: formErrors, isValid },
    watch,
    setValue,
    trigger,
  } = useCheckoutForm();

  const deliveryMethod = watch('deliveryMethod');
  const selectedPickup = watch('pickupLocationId') || PICKUP_LOCATIONS[0].id;

  useEffect(() => {
    if (currentUser && !isPreFilledRef.current) {
      if (currentUser.name)
        setValue('name', currentUser.name, { shouldValidate: true });
      if (currentUser.email)
        setValue('email', currentUser.email, { shouldValidate: true });
      if (currentUser.phone)
        setValue('phone', currentUser.phone, { shouldValidate: true });
      isPreFilledRef.current = true;
    }
  }, [currentUser, setValue]);

  const items = cart?.items || [];
  const totalPrice = cart?.totalPrice ?? 0;
  const baseShippingCost = cart?.shippingCost ?? 5.0;
  const subtotalPrice = Math.max(0, totalPrice - baseShippingCost);

  const activeShippingCost = baseShippingCost;
  const calculatedTotal = totalPrice;

  const onFormSubmit = async (_data: CheckoutFormData) => {
    createOrderMutation.reset();

    try {
      const orderData = await createOrderMutation.mutateAsync();
      navigate(`/order-result?orderId=${orderData.orderId}`);
    } catch {
      // Error is caught here to prevent Unhandled Promise Rejection in browser console.
      // createOrderMutation.error is managed by React Query and displayed in the UI banner.
    }
  };

  const handlePlaceOrderClick = () => {
    if (!agreeToTerms) {
      setTermsError('You must agree to the Terms and Conditions');
      return;
    }
    setTermsError(undefined);
    if (!canSubmit() || createOrderMutation.isPending) return;
    handleSubmit(onFormSubmit)();
  };

  if (isCartLoading) {
    return (
      <LayoutPage>
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </LayoutPage>
    );
  }

  if (cartError) {
    return (
      <LayoutPage>
        <ErrorSection
          title="Failed to load checkout details"
          message={cartError.response?.data?.message || cartError.message}
          retryText="Retry"
          onRetry={() => refetch()}
        />
      </LayoutPage>
    );
  }

  if (!items || items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const serverErrorMsg =
    createOrderMutation.error?.response?.data?.message ||
    createOrderMutation.error?.message;

  return (
    <LayoutPage>
      <CartHeader
        title="Checkout"
        subtitle="Review your order details and confirm purchase"
      />

      {serverErrorMsg && (
        <NoticeAlert
          variant="error"
          title="Order Placement Failed"
          message={serverErrorMsg}
          className="mb-6"
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                onClick={handlePlaceOrderClick}
                disabled={createOrderMutation.isPending}
              >
                <RotateCcw className="size-3.5 mr-1.5" />
                {createOrderMutation.isPending ? 'Retrying...' : 'Try Again'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100 text-xs"
                onClick={() => createOrderMutation.reset()}
              >
                Dismiss
              </Button>
            </div>
          }
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="size-5 text-gray-700" />
                  Contact Information
                </div>
                {currentUser && (
                  <Badge
                    variant="outline"
                    className="text-xs border-emerald-300 text-emerald-700 bg-emerald-50"
                  >
                    Pre-filled from account
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <TextField
                    type="text"
                    label="Full Name"
                    id="name"
                    placeholder="e.g. John Doe"
                    value={watch('name')}
                    onChange={val =>
                      setValue('name', val, { shouldValidate: true })
                    }
                    error={formErrors.name?.message}
                    leftIcon={<User className="size-4" />}
                  />
                </div>

                <TextField
                  type="email"
                  label="Email"
                  id="email"
                  placeholder="e.g. john@example.com"
                  value={watch('email')}
                  onChange={val =>
                    setValue('email', val, { shouldValidate: true })
                  }
                  error={formErrors.email?.message}
                  leftIcon={<Mail className="size-4" />}
                />

                <TextField
                  type="tel"
                  label="Phone Number"
                  id="phone"
                  placeholder="e.g. +380991234567"
                  value={watch('phone')}
                  onChange={val =>
                    setValue('phone', val, { shouldValidate: true })
                  }
                  error={formErrors.phone?.message}
                  leftIcon={<Phone className="size-4" />}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="size-5 text-gray-700" />
                Delivery Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <DeliveryMethodSelector
                selectedMethod={deliveryMethod}
                onSelectMethod={method => {
                  setValue('deliveryMethod', method);
                  trigger([
                    'deliveryMethod',
                    'street',
                    'building',
                    'apartment',
                    'pickupLocationId',
                  ]);
                }}
                baseShippingCost={baseShippingCost}
              />

              {deliveryMethod === 'delivery' && (
                <DeliveryAddressForm
                  street={watch('street') || ''}
                  building={watch('building') || ''}
                  apartment={watch('apartment') || ''}
                  errors={{
                    street: formErrors.street?.message,
                    building: formErrors.building?.message,
                    apartment: formErrors.apartment?.message,
                  }}
                  onChangeField={(field, val) =>
                    setValue(field, val, { shouldValidate: true })
                  }
                />
              )}

              {deliveryMethod === 'pickup' && (
                <PickupLocationSelector
                  locations={PICKUP_LOCATIONS}
                  selectedLocationId={selectedPickup}
                  onSelectLocation={id => setValue('pickupLocationId', id)}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <OrderSummary
          subtotal={subtotalPrice}
          shippingCost={activeShippingCost}
          totalCost={calculatedTotal}
          agreeToTerms={agreeToTerms}
          agreeToTermsError={termsError}
          onAgreeToTermsChange={val => {
            setAgreeToTerms(val);
            if (val) setTermsError(undefined);
          }}
          actionButtonText="Confirm & Place Order"
          onAction={handlePlaceOrderClick}
          isActionDisabled={createOrderMutation.isPending || !isValid}
          isActionLoading={createOrderMutation.isPending}
          secondaryActionText="Return to Cart"
          secondaryActionLink="/cart"
          className="sticky top-6 lg:max-w-none"
        >
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Items ({items.length})
            </p>
            <div className="divide-y max-h-48 overflow-y-auto pr-1">
              {items.map(item => (
                <div
                  key={item.cartItemId}
                  className="py-2 flex justify-between items-center text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-xs">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900 text-xs">
                    {formatCurrency(
                      (item.discountPrice && item.discountPrice < item.price
                        ? item.discountPrice
                        : item.price) * item.quantity
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Separator />
        </OrderSummary>
      </div>
    </LayoutPage>
  );
};

export default Checkout;
