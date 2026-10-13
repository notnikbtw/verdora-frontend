import type React from 'react';
import { Separator } from '@components/ui/separator';
import { Button } from '@components/ui/button';
import { Link } from 'react-router-dom';
import { Skeleton } from '@components/ui/skeleton';
import { Checkbox } from '@components/ui/checkbox';
import { Label } from '@components/ui/label';
import { formatOrderPrice } from '@/utils/order.utils';

type Props = {
  totalItems?: number;
  totalItemsPrice?: number;
  subtotal?: number;
  shippingCost?: number;
  shippingText?: React.ReactNode;
  totalCost: number;
  agreeToTerms?: boolean;
  agreeToTermsError?: string;
  onAgreeToTermsChange?: (value: boolean) => void;
  showTerms?: boolean;
  actionButtonText?: string;
  onAction?: () => void;
  handleProceedToCheckout?: () => void;
  isActionDisabled?: boolean;
  isActionLoading?: boolean;
  secondaryActionText?: string;
  secondaryActionLink?: string;
  onSecondaryAction?: () => void;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const OrderSummary = ({
  totalItems,
  totalItemsPrice,
  subtotal,
  shippingCost,
  shippingText,
  totalCost,
  agreeToTerms = false,
  agreeToTermsError,
  onAgreeToTermsChange,
  showTerms = true,
  actionButtonText = 'Proceed to Checkout',
  onAction,
  handleProceedToCheckout,
  isActionDisabled = false,
  isActionLoading = false,
  secondaryActionText = 'Continue Shopping',
  secondaryActionLink = '/catalog',
  onSecondaryAction,
  loading = false,
  className = '',
  children,
}: Props) => {
  const displaySubtotal = subtotal !== undefined ? subtotal : totalItemsPrice;
  const triggerAction = onAction || handleProceedToCheckout;
  const hasTerms = Boolean(showTerms && onAgreeToTermsChange);

  if (loading) {
    return (
      <div
        className={`bg-white p-4 sm:p-6 md:p-8 flex flex-col rounded-2xl border w-full lg:w-80 shrink-0 gap-6 ${className}`}
      >
        <Skeleton className="h-6 w-40" />

        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <Skeleton className="h-px w-full" />
        <Skeleton className="h-6 w-full text-lg font-bold" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white p-4 sm:p-6 flex flex-col rounded-2xl border shadow-sm w-full lg:w-80 shrink-0 gap-4 ${className}`}
    >
      <h2 className="text-lg font-bold text-gray-900 border-b pb-3">
        Order Summary
      </h2>

      {children}

      <div className="space-y-3 pt-1">
        {displaySubtotal !== undefined && (
          <div className="flex justify-between text-sm text-gray-600 gap-2">
            <span>
              Subtotal {totalItems !== undefined ? `(${totalItems} items)` : ''}
            </span>
            <span className="font-medium text-gray-900 shrink-0">
              {formatOrderPrice(displaySubtotal)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-gray-600 gap-2">
          <span>Shipping</span>
          {shippingText !== undefined ? (
            shippingText
          ) : (
            <span className="font-medium text-gray-900 shrink-0">
              {formatOrderPrice(shippingCost ?? 0)}
            </span>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between font-bold text-gray-900 gap-2">
        <span className="text-base">Total</span>
        <span className="text-xl text-emerald-700 shrink-0">
          {formatOrderPrice(totalCost ?? 0)}
        </span>
      </div>

      {hasTerms && (
        <div className="flex gap-2 flex-col w-full pt-1">
          <div className="flex items-start gap-2.5 w-full text-xs">
            <Checkbox
              id="orderSummaryTerms"
              checked={agreeToTerms}
              onCheckedChange={checked =>
                onAgreeToTermsChange!(Boolean(checked))
              }
              className="mt-0.5"
            />
            <Label
              htmlFor="orderSummaryTerms"
              className="text-xs text-gray-600 cursor-pointer leading-tight"
            >
              I agree to the{' '}
              <Link
                to="/terms"
                className="underline underline-offset-4 text-gray-900 font-medium"
              >
                Terms and Conditions
              </Link>
            </Label>
          </div>

          {agreeToTermsError && !agreeToTerms && (
            <p className="text-red-500 text-xs">{agreeToTermsError}</p>
          )}
        </div>
      )}

      <div className="space-y-3 pt-2">
        <Button
          onClick={triggerAction}
          disabled={isActionDisabled || isActionLoading}
          className="w-full py-6 text-base font-semibold"
        >
          {isActionLoading ? 'Processing...' : actionButtonText}
        </Button>

        {secondaryActionText &&
          (secondaryActionLink ? (
            <Button variant="outline" className="w-full" asChild>
              <Link to={secondaryActionLink}>{secondaryActionText}</Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={onSecondaryAction}
            >
              {secondaryActionText}
            </Button>
          ))}
      </div>
    </div>
  );
};

export default OrderSummary;
