import { useState, useEffect, useRef, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Separator } from '@components/ui/separator';
import { Skeleton } from '@components/ui/skeleton';
import ErrorSection from '@components/common/section/ErrorSection';
import CartHeader from '@components/layout/pageComponents/CartHeader';
import TextField from '@components/common/forms/TextField';
import OrderSummary from '@components/common/cards/OrderSummary';
import { formatCurrency } from '@/utils/order.utils';
import { useGetCart } from '@api/cart/cart.hooks';
import { useCreateOrder } from '@api/order/order.hooks';
import { useGetCurrentUser } from '@api/user/user.hooks';
import { useCheckoutForm } from '@hooks/useCheckoutForm';
import type { CheckoutFormData } from '@/schemas/checkout.schema';
import { rateLimit } from '@/utils/rateLimit';
import { clearCheckoutDraft } from '@/utils/checkoutDraft';
import {
  PICKUP_LOCATIONS,
  SUBMIT_RATE_LIMIT_MS,
} from '@/config/checkout.config';
import { Truck, User, Mail, Phone } from 'lucide-react';
import { focusFirstInvalidField } from '@/utils/form.utils';
import DeliveryMethodSelector from '@components/checkout/DeliveryMethodSelector';
import DeliveryAddressForm from '@components/checkout/DeliveryAddressForm';
import PickupLocationSelector from '@components/checkout/PickupLocationSelector';

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
  const isPreFilledRef = useRef(false);
  const canSubmit = useMemo(() => rateLimit(SUBMIT_RATE_LIMIT_MS), []);

  const {
    handleSubmit,
    formState: { errors: formErrors, isValid, isValidating },
    watch,
    setValue,
    getValues,
  } = useCheckoutForm();

  const deliveryMethod = watch('deliveryMethod');
  const selectedPickup = watch('pickupLocationId') || PICKUP_LOCATIONS[0].id;

  useEffect(() => {
    if (currentUser && !isPreFilledRef.current) {
      if (currentUser.name && !getValues('name'))
        setValue('name', currentUser.name, { shouldValidate: true });
      if (currentUser.email && !getValues('email'))
        setValue('email', currentUser.email, { shouldValidate: true });
      if (currentUser.phone && !getValues('phone'))
        setValue('phone', currentUser.phone, { shouldValidate: true });
      isPreFilledRef.current = true;
    }
  }, [currentUser, setValue, getValues]);

  const items = cart?.items || [];
  const totalPrice = cart?.totalPrice ?? 0;
  const shippingCost = cart?.shippingCost ?? 0;
  const subtotalPrice = Math.max(0, totalPrice - shippingCost);

  const onFormSubmit = async (_data: CheckoutFormData) => {
    if (!agreeToTerms || createOrderMutation.isPending || !canSubmit()) return;
    createOrderMutation.reset();

    try {
      const orderData = await createOrderMutation.mutateAsync();
      if (currentUser) clearCheckoutDraft(currentUser.id);
      navigate(`/order-result?orderId=${orderData.orderId}`);
    } catch {
      // Error is caught here to prevent Unhandled Promise Rejection in browser console.
      // MutationCache displays one error toast; preserve the form for retry.
    }
  };

  const handlePlaceOrderClick = () => {
    if (createOrderMutation.isPending) return;
    if (!agreeToTerms) {
      document.querySelector<HTMLElement>('[data-order-terms]')?.focus();
      return;
    }
    void handleSubmit(onFormSubmit, () =>
      focusFirstInvalidField('checkout-form')
    )();
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

  return (
    <LayoutPage>
      <div className="page-stack">
        <CartHeader
          title="Checkout"
          subtitle="Review your order details and confirm purchase"
        />

        <form
          id="checkout-form"
          noValidate
          aria-busy={createOrderMutation.isPending}
          onSubmit={event => {
            event.preventDefault();
            handlePlaceOrderClick();
          }}
          className="flex flex-col lg:flex-row gap-8 items-start"
        >
          <div className="min-w-0 flex-1 space-y-6 w-full">
            <fieldset
              disabled={createOrderMutation.isPending}
              className="min-w-0 space-y-6"
            >
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
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
                        required
                        autoComplete="name"
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
                      required
                      autoComplete="email"
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
                      required
                      autoComplete="tel"
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
                      setValue('deliveryMethod', method, {
                        shouldValidate: true,
                      });
                    }}
                    baseShippingCost={shippingCost}
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
                    <>
                      <p role="status" className="text-sm text-gray-600">
                        The shipping charge shown in Order Summary also applies
                        to pickup.
                      </p>
                      <PickupLocationSelector
                        locations={PICKUP_LOCATIONS}
                        selectedLocationId={selectedPickup}
                        onSelectLocation={id =>
                          setValue('pickupLocationId', id, {
                            shouldValidate: true,
                          })
                        }
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </fieldset>
          </div>

          <OrderSummary
            mobileActions
            subtotal={subtotalPrice}
            shippingCost={shippingCost}
            totalCost={totalPrice}
            agreeToTerms={agreeToTerms}
            onAgreeToTermsChange={setAgreeToTerms}
            actionButtonText="Confirm & Place Order"
            onAction={handlePlaceOrderClick}
            isActionDisabled={
              !isValid || isValidating || createOrderMutation.isPending
            }
            actionDisabledReason="Complete all required contact and delivery fields with valid details to continue."
            isActionLoading={createOrderMutation.isPending}
            secondaryActionText="Return to Cart"
            secondaryActionLink="/cart"
            className="lg:top-28"
          >
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Items ({items.length})
              </p>
              <div>
                {items.map(item => (
                  <div
                    key={item.cartItemId}
                    className="py-2 flex justify-between items-center text-sm"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-medium text-gray-900 text-xs truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold text-gray-900 text-xs">
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
        </form>
      </div>
    </LayoutPage>
  );
};

export default Checkout;
