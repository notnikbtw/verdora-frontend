import { formatCurrency } from '@/utils/order.utils';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Check, ShoppingBasket } from 'lucide-react';
import { useAppSelector } from '@api/hooks';
import { useAddItemToCart } from '@api/cart/cart.hooks';
import LoginPromptDialog, {
  type AuthPromptAction,
} from '@components/common/dialog/LoginPromptDialog';
import QuantityStepper from '@components/common/forms/QuantityStepper';
import { Skeleton } from '@components/ui/skeleton';
import { ProductAssuranceCards } from './ProductAssuranceCards';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Spinner } from '@components/ui/spinner';
import MobileActionBar from '@components/common/MobileActionBar';

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
  // Drives the button's "Added to cart" label only; the notification is a toast.
  const [justAdded, setJustAdded] = useState(false);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
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
    if (addItemMutation.isPending) return;
    if (onAddToCart) {
      onAddToCart(product.productId, quantity);
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
            markJustAdded();
          },
        }
      );
    }
  }, [onAddToCart, product, quantity, addItemMutation, markJustAdded]);

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
              className="text-3xl sm:text-[40px] font-heading font-bold text-[#0C0C0C] leading-[1.1] tracking-tight"
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
            {formatCurrency(currentPrice)}
          </span>

          {hasDiscount && originalPrice !== undefined && (
            <>
              <span className="flex items-baseline gap-1.5 text-lg sm:text-xl font-medium tracking-tight text-[#0C0C0C]">
                <span className="text-xs text-[#586455] font-normal">Was</span>
                <span className="line-through decoration-2">
                  {formatCurrency(originalPrice)}
                </span>
              </span>

              <span className="text-sm font-semibold text-[#0C0C0C] border border-[#0C0C0C] rounded-[7px] px-2.5 py-0.5">
                −{discountPercent}% · save {formatCurrency(savings)}
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
            disabled={addItemMutation.isPending}
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
                <ShoppingBasket aria-hidden="true" className="size-5" />
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
      </div>

      <ProductAssuranceCards />

      <MobileActionBar>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">
              Total · {quantity} {quantity === 1 ? 'item' : 'items'}
            </p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(currentPrice * quantity)}
            </p>
          </div>
          <QuantityStepper
            value={quantity}
            onChange={handleQuantityChange}
            min={1}
            size="sm"
            disabled={addItemMutation.isPending}
          />
        </div>
        <Button
          type="button"
          onClick={handleAddToCart}
          disabled={addItemMutation.isPending}
          aria-busy={addItemMutation.isPending}
          className="min-h-11 w-full"
        >
          {addItemMutation.isPending
            ? 'Adding...'
            : justAdded
              ? 'Added to cart'
              : 'Add to cart'}
        </Button>
      </MobileActionBar>

      <LoginPromptDialog
        open={isLoginPromptOpen}
        onOpenChange={setIsLoginPromptOpen}
        action={loginPromptAction}
      />
    </div>
  );
};

export default ProductInfo;
