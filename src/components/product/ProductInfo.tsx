import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Check } from 'lucide-react';
import { useAppSelector } from '@api/hooks';
import { useAddItemToCart } from '@api/cart/cart.hooks';
import LoginPromptDialog, {
  type AuthPromptAction,
} from '@components/common/dialog/LoginPromptDialog';
import QuantityStepper from '@components/common/forms/QuantityStepper';
import NoticeAlert from '@components/common/NoticeAlert';
import { Skeleton } from '@components/ui/skeleton';
import { ProductAssuranceCards } from './ProductAssuranceCards';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Spinner } from '@components/ui/spinner';

export type ProductInfoProps = {
  product: Product;
  categoryName?: string;
  isLoadingCategory?: boolean;
  onAddToCart?: (productId: number, quantity: number) => void;
  onToggleFavorite?: (productId: number) => void;
  isFavorite?: boolean;
  isFavoritePending?: boolean;
  className?: string;
  descriptionClamp?: string;
  reviewsCount?: number;
  rating?: number;
};

export const ProductInfo = ({
  product,
  categoryName,
  isLoadingCategory = false,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  isFavoritePending = false,
  className,
  descriptionClamp = 'line-clamp-4',
  reviewsCount,
  rating,
}: ProductInfoProps) => {
  const { user } = useAppSelector(state => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [loginPromptAction, setLoginPromptAction] =
    useState<AuthPromptAction>('general');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Drives the button's "Added to cart" label only; the notification is a toast.
  const [justAdded, setJustAdded] = useState(false);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissError = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    setErrorMessage(null);
  }, []);

  const markJustAdded = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setJustAdded(true);
    toastTimerRef.current = setTimeout(() => {
      setJustAdded(false);
      toastTimerRef.current = null;
    }, 4500);
  }, []);

  const triggerError = useCallback((msg: string) => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
    setErrorMessage(msg);
    errorTimerRef.current = setTimeout(() => {
      setErrorMessage(null);
      errorTimerRef.current = null;
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  const addItemMutation = useAddItemToCart();

  const hasDiscount = Boolean(
    product.discountPrice && product.discountPrice < product.price
  );
  const currentPrice = hasDiscount ? product.discountPrice! : product.price;
  const originalPrice = hasDiscount ? product.price : undefined;
  const savings =
    hasDiscount && originalPrice ? originalPrice - currentPrice : 0;
  const discountPercent =
    hasDiscount && originalPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  const handleQuantityChange = useCallback(
    (newQty: number) => setQuantity(Math.max(1, newQty)),
    []
  );

  const handleAddToCart = useCallback(() => {
    if (onAddToCart) {
      onAddToCart(product.productId, quantity);
      dismissError();
      markJustAdded();
    } else {
      addItemMutation.mutate(
        {
          productId: product.productId,
          quantity,
          product,
        },
        {
          onSuccess: () => {
            dismissError();
            markJustAdded();
          },
          onError: error => {
            triggerError(
              error.response?.data?.message ||
                'Failed to add item to cart. Please try again.'
            );
          },
        }
      );
    }
  }, [
    onAddToCart,
    product,
    quantity,
    addItemMutation,
    dismissError,
    markJustAdded,
    triggerError,
  ]);

  const handleToggleFavorite = useCallback(() => {
    if (isFavoritePending) return;

    if (!user) {
      setLoginPromptAction('favorite');
      setIsLoginPromptOpen(true);
      return;
    }
    onToggleFavorite?.(product.productId);
  }, [user, onToggleFavorite, product.productId, isFavoritePending]);

  return (
    <div
      className={cn(
        'flex flex-col justify-between w-full min-w-0 lg:h-full gap-4',
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            {categoryName ? (
              <Link
                to={
                  product.categoryId
                    ? `/catalog?category=${product.categoryId}`
                    : '/catalog'
                }
                className="bg-[#E5EFE2] hover:bg-[#d7e6d3] text-[#0C0C0C] text-[13px] font-medium tracking-tight rounded-[7px] px-2.5 py-1 transition-colors"
              >
                {categoryName}
              </Link>
            ) : isLoadingCategory ? (
              <Skeleton className="h-6 w-20 rounded-[7px]" />
            ) : null}

            {Boolean(reviewsCount && reviewsCount > 0) && (
              <div className="flex items-center gap-1.5 text-[13px] text-[#586455]">
                <span className="text-[#3E8D35] text-sm tracking-widest">
                  {'★'.repeat(
                    Math.max(0, Math.min(5, Math.round(rating ?? 5)))
                  )}
                  {'☆'.repeat(Math.max(0, 5 - Math.round(rating ?? 5)))}
                </span>
                <span>
                  {rating?.toFixed(1) ?? '5.0'} · {reviewsCount} reviews
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h1
              title={product.name}
              className="truncate text-3xl sm:text-[40px] font-heading font-bold text-[#0C0C0C] leading-[1.1] tracking-tight"
            >
              {product.name}
            </h1>
            <p className="text-sm text-text-muted mt-1.5">
              SKU VD-{product.productId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3 flex-wrap">
          <span
            className={cn(
              'text-2xl sm:text-[32px] font-heading font-semibold leading-tight tracking-tight rounded-[10px] px-3.5 py-0.5 shadow-xs',
              hasDiscount
                ? 'bg-[#FA1105] text-white'
                : 'bg-[#D9DEDB] text-[#0C0C0C]'
            )}
          >
            {currentPrice}₴
          </span>

          {hasDiscount && originalPrice !== undefined && (
            <>
              <span className="flex items-baseline gap-1.5 text-lg sm:text-xl font-medium tracking-tight text-[#0C0C0C]">
                <span className="text-xs text-[#586455] font-normal">Was</span>
                <span className="line-through decoration-2">
                  {originalPrice}₴
                </span>
              </span>

              <span className="text-sm font-semibold text-[#0C0C0C] border border-[#0C0C0C] rounded-[7px] px-2.5 py-0.5">
                −{discountPercent}% · save {savings}₴
              </span>
            </>
          )}
        </div>

        <p
          title={product.description}
          className={cn(
            'text-[15px] sm:text-base text-[#5c665d] leading-relaxed max-w-xl',
            descriptionClamp
          )}
        >
          {product.description || 'No description available for this product.'}
        </p>

        <div className="flex items-center gap-3 sm:gap-3.5 w-full">
          <QuantityStepper
            value={quantity}
            onChange={handleQuantityChange}
            min={1}
            size="default"
          />

          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={addItemMutation.isPending}
            className="h-12 flex-1 rounded-[16px] bg-[#3E8D35] hover:bg-[#34782c] disabled:opacity-70 text-white font-medium text-[15px] tracking-tight flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            {justAdded ? (
              <>
                <Check className="size-5 stroke-[2.5]" />
                <span>Added to cart</span>
              </>
            ) : addItemMutation.isPending ? (
              <span>Adding...</span>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <path d="M9 8V6.5A3 3 0 0 1 15 6.5V8" />
                  <path d="M4 8h16l-1.3 10.2a2 2 0 0 1-2 1.8H7.3a2 2 0 0 1-2-1.8L4 8Z" />
                  <path d="M10 12v3M14 12v3" />
                </svg>
                <span>Add to cart</span>
              </>
            )}
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleToggleFavorite}
          disabled={isFavoritePending}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={cn(
            'h-12 w-fit px-6 rounded-[16px] font-medium text-[15px] tracking-tight transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
            isFavorite
              ? 'border-[#FA1105] text-[#FA1105] bg-[#FFF5F4] hover:bg-[#ffeceb] hover:text-[#FA1105]'
              : 'border-[#D9DEDB] text-[#0C0C0C] hover:border-zinc-400 hover:bg-[#fcfdfb]'
          )}
        >
          {isFavoritePending ? (
            <Spinner className="size-5" />
          ) : (
            <Heart
              className={cn(
                'size-5 stroke-[1.8] transition-colors',
                isFavorite ? 'fill-[#FA1105] text-[#FA1105]' : 'text-[#0C0C0C]'
              )}
            />
          )}
          <span>{isFavorite ? 'Added to favorites' : 'Add to favorites'}</span>
        </Button>

        {errorMessage && (
          <NoticeAlert
            variant="error"
            className="rounded-[16px] py-3.5 px-4 shadow-xs"
            onDismiss={dismissError}
          >
            <span className="text-[15px] font-medium">{errorMessage}</span>
          </NoticeAlert>
        )}
      </div>

      <ProductAssuranceCards />

      <LoginPromptDialog
        open={isLoginPromptOpen}
        onOpenChange={setIsLoginPromptOpen}
        action={loginPromptAction}
      />
    </div>
  );
};

export default ProductInfo;
