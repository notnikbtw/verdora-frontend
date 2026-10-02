import { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@components/ui/button';
import { ShoppingCart, Package } from 'lucide-react';
import CartItem from '@components/common/cards/CartItem';
import OrderSummary from '@components/common/cards/OrderSummary';
import CartItemSkeleton from '@components/common/cards/CartItemSkeleton';
import { EmptySection } from '@components/common/section/EmptySection';
import ErrorSection from '@components/common/section/ErrorSection';
import NoticeAlert from '@components/common/NoticeAlert';
import { useProceedToCheckout } from '@hooks/useProceedToCheckout';
import { rateLimit } from '@/utils/rateLimit';
import {
  useGetCart,
  useRemoveItemFromCart,
  useUpdateCartItemQuantity,
} from '@api/cart/cart.hooks';

export const ProfileCartTab = () => {
  const navigate = useNavigate();
  const canSubmit = useMemo(() => rateLimit(2000), []);

  const { data: cart, isLoading, error: queryError, refetch } = useGetCart();
  const updateQuantityMutation = useUpdateCartItemQuantity();
  const removeItemMutation = useRemoveItemFromCart();

  const items = cart?.items || [];
  const totalPrice = cart?.totalPrice ?? 0;
  const shippingCost = cart?.shippingCost ?? 0;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const {
    handleSubmit,
    formState: { errors: formErrors },
    setValue,
    watch,
  } = useProceedToCheckout();

  const agreeToTerms = watch('agreeToTerms');

  const handleIncrease = (id: number) => {
    const item = items.find(i => i.cartItemId === id);
    if (item) {
      removeItemMutation.reset();
      updateQuantityMutation.mutate(
        {
          cartItemId: id,
          quantity: item.quantity + 1,
        },
        {
          onSuccess: () => {
            removeItemMutation.reset();
          },
        }
      );
    }
  };

  const handleDecrease = (id: number) => {
    const item = items.find(i => i.cartItemId === id);
    if (item && item.quantity > 1) {
      removeItemMutation.reset();
      updateQuantityMutation.mutate(
        {
          cartItemId: id,
          quantity: item.quantity - 1,
        },
        {
          onSuccess: () => {
            removeItemMutation.reset();
          },
        }
      );
    }
  };

  const handleRemove = (id: number) => {
    updateQuantityMutation.reset();
    removeItemMutation.mutate(
      { cartItemId: id },
      {
        onSuccess: () => {
          updateQuantityMutation.reset();
        },
      }
    );
  };

  const handleAgreeToTerms = (value: boolean) => {
    setValue('agreeToTerms', value, { shouldValidate: true });
  };

  const handleProceedToCheckout = handleSubmit(() => {
    if (!canSubmit()) return;
    navigate('/checkout');
  });

  const mutationError =
    updateQuantityMutation.error?.response?.data?.message ||
    removeItemMutation.error?.response?.data?.message;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#EDF5E9] text-[#2F6B29]">
              <ShoppingCart className="size-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                Shopping Cart
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Review items in your cart and continue to checkout.
              </p>
            </div>
          </div>

          {totalItems > 0 && (
            <span className="inline-flex items-center rounded-full bg-[#EDF5E9] px-3 py-1 text-xs font-semibold text-[#2F6B29] self-start sm:self-auto">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
      </div>

      {mutationError && (
        <NoticeAlert
          variant="error"
          message={mutationError}
          onDismiss={() => {
            updateQuantityMutation.reset();
            removeItemMutation.reset();
          }}
        />
      )}

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>
      ) : queryError ? (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
          <ErrorSection
            title="Failed to load cart"
            message={
              queryError.response?.data?.message ||
              queryError.message ||
              'We were unable to load your shopping cart.'
            }
            retryText="Retry"
            onRetry={() => refetch()}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center shadow-xs">
          <EmptySection
            title="Cart is empty"
            description="You haven't added any products yet. Browse our collection and find something you love."
            icon={
              <div className="flex items-center justify-center rounded-full bg-[#EDF5E9] p-4 text-[#2F6B29]">
                <Package className="size-10" aria-hidden="true" />
              </div>
            }
            action={
              <Button asChild variant="default" className="rounded-xl">
                <Link to="/catalog">Browse Catalog</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row items-start gap-8">
          <div className="flex flex-col gap-4 flex-1 w-full min-w-0">
            {items.map(item => (
              <CartItem
                key={item.cartItemId}
                productName={item.productName}
                productImage={item.imageUrl}
                price={item.price}
                discountPrice={item.discountPrice}
                quantity={item.quantity}
                onIncrease={() => handleIncrease(item.cartItemId)}
                onDecrease={() => handleDecrease(item.cartItemId)}
                onRemove={() => handleRemove(item.cartItemId)}
              />
            ))}
          </div>

          <div className="w-full xl:w-80 shrink-0">
            <OrderSummary
              totalItems={totalItems}
              totalItemsPrice={totalPrice - shippingCost}
              shippingCost={shippingCost}
              totalCost={totalPrice}
              agreeToTerms={agreeToTerms}
              agreeToTermsError={formErrors.agreeToTerms?.message}
              onAgreeToTermsChange={handleAgreeToTerms}
              handleProceedToCheckout={handleProceedToCheckout}
              loading={
                updateQuantityMutation.isPending || removeItemMutation.isPending
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCartTab;
