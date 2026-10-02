import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import { Heart, Flower2, Check } from 'lucide-react';
import { useAppSelector } from '@api/hooks';
import { cn } from '@/lib/utils';
import type { ViewMode } from './CatalogToolbar';
import type { Product } from '@/types/product';

export type CatalogProduct = Product;

type Props = {
  product: Product;
  categoryName?: string;
  viewMode?: ViewMode;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  onAddToCart?: (id: number) => void;
  onAuthRequired?: () => void;
  isAuthenticated?: boolean;
  onProductClick?: (productId: number) => void;
  className?: string;
};

export const CatalogProductCard = ({
  product,
  categoryName,
  viewMode = 'grid',
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
  onAuthRequired,
  isAuthenticated,
  onProductClick,
  className,
}: Props) => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const isLoggedIn =
    isAuthenticated !== undefined ? isAuthenticated : Boolean(user);

  const [internalFav, setInternalFav] = useState(isFavorite);
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const isGrid = viewMode === 'grid';

  const addTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInternalFav(isFavorite);
  }, [isFavorite]);

  useEffect(() => {
    return () => {
      if (addTimerRef.current) {
        clearTimeout(addTimerRef.current);
      }
    };
  }, []);

  const hasDiscount = Boolean(
    product.discountPrice && product.discountPrice < product.price
  );
  const currentPrice = hasDiscount ? product.discountPrice! : product.price;
  const originalPrice = hasDiscount ? product.price : undefined;
  const productId = product.productId;

  const handleCardClick = (e?: React.MouseEvent) => {
    if (e && (e.button === 1 || e.ctrlKey || e.metaKey)) {
      window.open(`/products/${productId}`, '_blank');
      return;
    }
    if (onProductClick) {
      onProductClick(productId);
    } else {
      navigate(`/products/${productId}`);
    }
  };

  const handleAuxClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 1) {
      e.preventDefault();
      handleCardClick(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target as HTMLElement;
      if (!target.closest('button')) {
        e.preventDefault();
        handleCardClick();
      }
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      onAuthRequired?.();
      return;
    }
    setInternalFav(prev => !prev);
    onToggleFavorite?.(productId);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(productId);
    setAdded(true);
    if (addTimerRef.current) {
      clearTimeout(addTimerRef.current);
    }
    addTimerRef.current = setTimeout(() => {
      setAdded(false);
      addTimerRef.current = null;
    }, 1500);
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onAuxClick={handleAuxClick}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${product.name}`}
      className={cn(
        'border border-border bg-[#fcfdfb] rounded-[22px] overflow-hidden p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isGrid
          ? 'flex flex-col gap-3.5'
          : 'flex flex-col sm:flex-row items-center gap-5',
        className
      )}
    >
      <div
        className={`flex items-start justify-between gap-3 w-full ${
          !isGrid ? 'order-2 flex-1' : ''
        }`}
      >
        <div className="flex-1 min-w-0">
          {categoryName && (
            <span className="text-[11px] font-semibold tracking-wider uppercase text-text-muted mb-0.5 block">
              {categoryName}
            </span>
          )}
          <h3 className="font-heading font-medium text-[16px] leading-[1.3] text-[#0C0C0C] tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {!isGrid && product.description && (
            <p className="text-xs text-text mt-1.5 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`size-9 rounded-full border flex items-center justify-center cursor-pointer transition-colors bg-white ${
              internalFav
                ? 'border-[#FA1105]/40 text-[#FA1105]'
                : 'border-[#D9DEDB] text-[#0C0C0C] hover:border-zinc-400'
            }`}
            aria-label={
              internalFav ? 'Remove from favourites' : 'Add to favourites'
            }
          >
            <Heart
              className={`size-4 stroke-[1.6] ${
                internalFav ? 'fill-[#FA1105]' : ''
              }`}
            />
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`size-9 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-xs text-white ${
              added
                ? 'bg-emerald-600 scale-105'
                : 'bg-[#3E8D35] hover:bg-[#34782c]'
            }`}
            aria-label="Add to cart"
            title={added ? 'Added to cart' : 'Add to cart'}
          >
            {added ? (
              <Check className="size-4 stroke-[2.5]" />
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 8V6.5A3 3 0 0 1 15 6.5V8" />
                <path d="M4 8h16l-1.3 10.2a2 2 0 0 1-2 1.8H7.3a2 2 0 0 1-2-1.8L4 8Z" />
                <path d="M10 12v3M14 12v3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div
        className={`relative w-full rounded-[14px] overflow-hidden bg-[#F2F3F0] flex items-center justify-center shrink-0 ${
          isGrid ? 'h-52 sm:h-56' : 'h-48 sm:w-64 sm:h-44 order-1'
        }`}
      >
        {product.imageUrl && !imageError ? (
          <>
            {!isImageLoaded && (
              <Skeleton className="absolute inset-0 size-full rounded-none" />
            )}
            <img
              src={product.imageUrl}
              alt={product.name}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setIsImageLoaded(true);
              }}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 text-text-muted p-4 text-center">
            <Flower2 className="size-10 stroke-[1.2] text-primary/40" />
            <span className="text-xs font-medium text-text-muted">
              {categoryName || 'Verdora Plant'}
            </span>
          </div>
        )}

        <div className="absolute left-3.5 bottom-3.5 flex items-center gap-1.5 z-10">
          <span
            className={`font-heading text-[15px] font-bold px-3 py-1 rounded-[7px] leading-tight tracking-tight shadow-xs ${
              hasDiscount
                ? 'bg-[#FA1105] text-white'
                : 'bg-[#D9DEDB] text-[#0C0C0C]'
            }`}
          >
            {currentPrice}₴
          </span>

          {hasDiscount && originalPrice !== undefined && (
            <span className="font-heading text-[12px] font-medium px-2.5 py-1 rounded-[7px] line-through leading-tight text-white bg-[#4C5C4A] shadow-xs">
              {originalPrice}₴
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CatalogProductCard;
