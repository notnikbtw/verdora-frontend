import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import { Button } from '@components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import CartIcon from '@assets/icons/cart.svg?react';
import CartItem from '@components/common/cards/CartItem';
import OrderSummary from '@components/common/cards/OrderSummary';
import { useEffect, useMemo, useState } from 'react';
import { useProceedToCheckout } from '@hooks/useProceedToCheckout';
import { rateLimit } from '@/utils/rateLimit';
import CartItemSkeleton from '@components/common/cards/CartItemSkeleton';
import CartHeader from '@components/layout/pageComponents/CartHeader';
import { EmptySection } from '@components/common/section/EmptySection';
import ErrorSection from '@components/common/section/ErrorSection';
import NoticeAlert from '@components/common/NoticeAlert';
import LoginPromptDialog from '@components/common/dialog/LoginPromptDialog';
import { useAppSelector } from '@api/hooks';
import {
  getStoredGuestCart,
  syncGuestCartToBackend,
  getGuestCartSyncError,
  clearGuestCartSyncError,
  clearGuestCart,
  isGuestCartSyncing,
  GUEST_CART_STORAGE_KEY,
  GUEST_CART_SYNC_ERROR_KEY,
} from '@/utils/guestCart';
import {
  useGetCart,
  useRemoveItemFromCart,
  useUpdateCartItemQuantity,
} from '@api/cart/cart.hooks';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isSyncingGuestCart, setIsSyncingGuestCart] = useState(() =>
    isGuestCartSyncing()
  );
  const [syncError, setSyncError] = useState<string | null>(() =>
    getGuestCartSyncError()
  );
  const [dismissedGuestWarning, setDismissedGuestWarning] = useState(false);
  const [guestCartCount, setGuestCartCount] = useState(() =>
    user ? getStoredGuestCart().length : 0
  );
  const canSubmit = useMemo(() => rateLimit(2000), []);

  const { data: cart, isLoading, error: queryError, refetch } = useGetCart();
  const updateQuantityMutation = useUpdateCartItemQuantity();
  const removeItemMutation = useRemoveItemFromCart();

  useEffect(() => {
    const handleStorageChange = (e?: StorageEvent | Event) => {
      if (
        !e ||
        !(e instanceof StorageEvent) ||
        e.key === GUEST_CART_STORAGE_KEY ||
        e.key === GUEST_CART_SYNC_ERROR_KEY ||
        e.key === null
      ) {
        if (user) {
          setGuestCartCount(getStoredGuestCart().length);
          setSyncError(getGuestCartSyncError());
        }
      }
    };

    const handleSyncStart = () => {
      setIsSyncingGuestCart(true);
    };

    const handleSyncEnd = () => {
      setIsSyncingGuestCart(false);
      if (user) {
        setGuestCartCount(getStoredGuestCart().length);
        setSyncError(getGuestCartSyncError());
      }
    };

    const handleSyncError = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;
      setSyncError(customEvent.detail ?? getGuestCartSyncError());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('guest-cart-synced', handleStorageChange);
    window.addEventListener('guest-cart-sync-start', handleSyncStart);
    window.addEventListener('guest-cart-sync-end', handleSyncEnd);
    window.addEventListener('guest-cart-sync-error', handleSyncError);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('guest-cart-synced', handleStorageChange);
      window.removeEventListener('guest-cart-sync-start', handleSyncStart);
      window.removeEventListener('guest-cart-sync-end', handleSyncEnd);
      window.removeEventListener('guest-cart-sync-error', handleSyncError);
    };
  }, [user]);

  // If user is logged in, has guest cart items in storage, sync is not currently in progress,
  // and no sync error was recorded yet, automatically trigger background sync
  useEffect(() => {
    if (user && guestCartCount > 0 && !isGuestCartSyncing() && !syncError) {
      setIsSyncingGuestCart(true);
      syncGuestCartToBackend()
        .then(() => {
          setGuestCartCount(0);
          setSyncError(null);
          refetch();
        })
        .catch(() => {
          setGuestCartCount(getStoredGuestCart().length);
          setSyncError(getGuestCartSyncError());
          refetch();
        })
        .finally(() => {
          setIsSyncingGuestCart(false);
        });
    }
  }, [user, guestCartCount, syncError, refetch]);

  const showGuestCartBanner =
    Boolean(user) &&
    guestCartCount > 0 &&
    !dismissedGuestWarning &&
    !isSyncingGuestCart &&
    Boolean(syncError);

  const handleTransferGuestCart = async () => {
    setIsSyncingGuestCart(true);
    try {
      await syncGuestCartToBackend();
      setGuestCartCount(0);
      setSyncError(null);
      await refetch();
    } catch {
      setGuestCartCount(getStoredGuestCart().length);
      setSyncError(getGuestCartSyncError());
      await refetch();
    } finally {
      setIsSyncingGuestCart(false);
    }
  };

  const handleDiscardGuestCart = () => {
    clearGuestCart();
    clearGuestCartSyncError();
    setGuestCartCount(0);
    setSyncError(null);
    setDismissedGuestWarning(true);
  };

  const items = cart?.items || [];
  const totalPrice = cart?.totalPrice ?? 0;
  const shippingCost = cart?.shippingCost ?? 0;
  const itemsCount = items.length;

  const {
    handleSubmit,
    formState: { errors: formErrors },
    setValue,
    watch,
  } = useProceedToCheckout();

  const agreeToTerms = watch('agreeToTerms');
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleIncrease = (id: number) => {
    const item = items.find(i => i.cartItemId === id);
    if (item) {
      updateQuantityMutation.mutate({
        cartItemId: id,
        quantity: item.quantity + 1,
      });
    }
  };

  const handleDecrease = (id: number) => {
    const item = items.find(i => i.cartItemId === id);
    if (item && item.quantity > 1) {
      updateQuantityMutation.mutate({
        cartItemId: id,
        quantity: item.quantity - 1,
      });
    }
  };

  const handleRemove = (id: number) => {
    removeItemMutation.mutate({ cartItemId: id });
  };

  const handleAgreeToTerms = (value: boolean) => {
    setValue('agreeToTerms', value, { shouldValidate: true });
  };

  const handleProceedToCheckout = handleSubmit(() => {
    if (!canSubmit()) return;
    if (!user) {
      setIsLoginPromptOpen(true);
      return;
    }
    navigate('/checkout');
  });

  if (isLoading) {
    return (
      <LayoutPage>
        <CartHeader itemsCount={0} />
        <div className="flex flex-col gap-4 mt-8 max-w-4xl mx-auto px-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>
      </LayoutPage>
    );
  }

  if (queryError) {
    return (
      <LayoutPage>
        <CartHeader itemsCount={0} />
        <ErrorSection
          title="Failed to load cart"
          message={queryError.response?.data?.message || queryError.message}
          retryText="Retry"
          onRetry={() => refetch()}
        />
      </LayoutPage>
    );
  }

  if (itemsCount === 0) {
    return (
      <LayoutPage>
        <CartHeader itemsCount={itemsCount} />
        {showGuestCartBanner && (
          <div className="mt-6">
            <NoticeAlert
              variant="warning"
              title="Unsaved guest cart items"
              message={
                syncError ||
                `You have ${guestCartCount} item(s) from your guest session that could not be transferred automatically.`
              }
              onDismiss={() => {
                setDismissedGuestWarning(true);
              }}
              action={
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTransferGuestCart}
                    disabled={isSyncingGuestCart}
                    className="h-8 text-xs font-medium cursor-pointer"
                  >
                    {isSyncingGuestCart
                      ? 'Transferring...'
                      : 'Transfer to Account'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDiscardGuestCart}
                    disabled={isSyncingGuestCart}
                    className="h-8 text-xs font-medium text-destructive hover:text-destructive cursor-pointer"
                  >
                    Discard
                  </Button>
                </div>
              }
            />
          </div>
        )}
        <EmptySection
          title="Cart is empty"
          description="You haven't added any products yet. Browse our collection and find something you love."
          className="rounded-xl border border-dashed border-border bg-card p-12 shadow-xs my-6"
          icon={
            <div className="flex items-center justify-center rounded-full bg-primary/10 p-4">
              <CartIcon className="size-8 text-primary" />
            </div>
          }
          action={
            <Button variant="default" asChild>
              <Link to="/catalog">Continue Shopping</Link>
            </Button>
          }
        />
      </LayoutPage>
    );
  }

  const mutationError =
    updateQuantityMutation.error?.response?.data?.message ||
    removeItemMutation.error?.response?.data?.message;

  return (
    <LayoutPage>
      <CartHeader itemsCount={itemsCount} />
      {showGuestCartBanner && (
        <NoticeAlert
          variant="warning"
          className="mt-6"
          title="Unsaved guest cart items"
          message={
            syncError ||
            `You have ${guestCartCount} item(s) from your guest session that could not be transferred automatically.`
          }
          onDismiss={() => {
            setDismissedGuestWarning(true);
          }}
          action={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <Button
                size="sm"
                variant="outline"
                onClick={handleTransferGuestCart}
                disabled={isSyncingGuestCart}
                className="h-8 text-xs font-medium cursor-pointer"
              >
                {isSyncingGuestCart ? 'Transferring...' : 'Transfer to Account'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDiscardGuestCart}
                disabled={isSyncingGuestCart}
                className="h-8 text-xs font-medium text-destructive hover:text-destructive cursor-pointer"
              >
                Discard
              </Button>
            </div>
          }
        />
      )}
      {mutationError && (
        <NoticeAlert
          variant="error"
          message={mutationError}
          className="mt-4 mb-6"
        />
      )}

      <div className="flex flex-col lg:flex-row items-start gap-8 mt-8">
        <div className="flex flex-col gap-4 flex-1 w-full">
          {items.map(item => (
            <CartItem
              key={item.cartItemId}
              productName={item.productName}
              productImage={item.imageUrl}
              price={item.price}
              discountPrice={item.discountPrice}
              quantity={item.quantity}
              isUpdating={
                updateQuantityMutation.isPending &&
                updateQuantityMutation.variables?.cartItemId === item.cartItemId
              }
              isRemoving={
                removeItemMutation.isPending &&
                removeItemMutation.variables?.cartItemId === item.cartItemId
              }
              onIncrease={() => handleIncrease(item.cartItemId)}
              onDecrease={() => handleDecrease(item.cartItemId)}
              onRemove={() => handleRemove(item.cartItemId)}
            />
          ))}
        </div>

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

      <LoginPromptDialog
        open={isLoginPromptOpen}
        onOpenChange={setIsLoginPromptOpen}
        action="checkout"
      />
    </LayoutPage>
  );
};

export default Cart;
