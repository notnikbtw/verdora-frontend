import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@components/ui/carousel';
import { Skeleton } from '@components/ui/skeleton';
import { CatalogProductCard } from '@components/catalog/CatalogProductCard';
import LoginPromptDialog from '@components/common/dialog/LoginPromptDialog';
import { useAppSelector } from '@api/hooks';
import { useAddItemToCart } from '@api/cart/cart.hooks';
import { useAllCategories } from '@api/category/category.hooks';
import type { Product } from '@/types/product';

export type ProductCarouselProps = {
  products?: Product[];
  title?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  categoryMap?: Map<number, string>;
  isLoading?: boolean;
  onAddToCart?: (productId: number) => void;
  onToggleFavorite?: (productId: number) => void;
  isFavorite?: (productId: number) => boolean;
  showNavigation?: boolean;
  showViewAll?: boolean;
  onProductClick?: (productId: number) => void;
};

export const ProductCarousel = ({
  products,
  title = 'You may also like',
  viewAllHref = '/catalog',
  viewAllLabel = 'View all',
  categoryMap: externalCategoryMap,
  isLoading = false,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  showNavigation = true,
  showViewAll = true,
  onProductClick,
}: ProductCarouselProps) => {
  const { user } = useAppSelector(state => state.auth);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  const { data: categories = [] } = useAllCategories();
  const internalCategoryMap = useMemo(() => {
    if (externalCategoryMap) return externalCategoryMap;
    const map = new Map<number, string>();
    categories.forEach(cat => {
      map.set(Number(cat.categoryId), cat.name);
    });
    return map;
  }, [externalCategoryMap, categories]);

  const addItemMutation = useAddItemToCart();
  const handleAddToCart = useCallback(
    (productId: number) => {
      if (onAddToCart) {
        onAddToCart(productId);
      } else {
        const product = products?.find(p => p.productId === productId);
        addItemMutation.mutate({ productId, quantity: 1, product });
      }
    },
    [onAddToCart, addItemMutation, products]
  );

  const handleToggleFavorite = useCallback(
    (productId: number) => {
      if (!user) {
        setIsLoginPromptOpen(true);
        return;
      }
      onToggleFavorite?.(productId);
    },
    [user, onToggleFavorite]
  );

  const items = useMemo(() => {
    return products || [];
  }, [products]);

  if (!isLoading && items.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-8 md:py-12">
      <Carousel
        opts={{
          align: 'start',
          loop: false,
          dragFree: false,
        }}
        className="w-full"
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl sm:text-[28px] font-heading font-bold tracking-tight text-[#0C0C0C]">
            {title}
          </h2>

          <div className="flex items-center gap-3">
            {showViewAll && (
              <Link
                to={viewAllHref}
                className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#3E8D35] hover:text-[#34782c] transition-colors group mr-1"
              >
                <span>{viewAllLabel}</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}

            {showNavigation && (
              <div className="flex items-center gap-2">
                <CarouselPrevious className="static translate-y-0 translate-x-0 size-9 rounded-full border border-border bg-white text-[#0C0C0C] hover:bg-[#F2F3F0] hover:border-zinc-400 disabled:opacity-40 transition-colors cursor-pointer" />
                <CarouselNext className="static translate-y-0 translate-x-0 size-9 rounded-full border border-border bg-white text-[#0C0C0C] hover:bg-[#F2F3F0] hover:border-zinc-400 disabled:opacity-40 transition-colors cursor-pointer" />
              </div>
            )}
          </div>
        </div>

        <CarouselContent className="-ml-4 sm:-ml-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <CarouselItem
                  key={`skeleton-${index}`}
                  className="pl-4 sm:pl-5 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div className="border border-border bg-[#fcfdfb] rounded-[22px] p-4 flex flex-col gap-3.5 h-full">
                    <div className="flex items-start justify-between gap-3 w-full">
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-5 w-3/4" />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="size-9 rounded-full" />
                        <Skeleton className="size-9 rounded-full" />
                      </div>
                    </div>
                    <div className="relative w-full rounded-[14px] overflow-hidden bg-[#F2F3F0] h-52 sm:h-56">
                      <Skeleton className="w-full h-full rounded-none" />
                      <Skeleton className="absolute left-3.5 bottom-3.5 h-6 w-16 rounded-[7px]" />
                    </div>
                  </div>
                </CarouselItem>
              ))
            : items.map(product => (
                <CarouselItem
                  key={product.productId}
                  className="pl-4 sm:pl-5 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <CatalogProductCard
                    product={product}
                    categoryName={internalCategoryMap.get(product.categoryId)}
                    isFavorite={
                      isFavorite ? isFavorite(product.productId) : false
                    }
                    onAddToCart={handleAddToCart}
                    onToggleFavorite={
                      onToggleFavorite ? handleToggleFavorite : undefined
                    }
                    onAuthRequired={() => setIsLoginPromptOpen(true)}
                    isAuthenticated={Boolean(user)}
                    onProductClick={onProductClick}
                    className="h-full"
                  />
                </CarouselItem>
              ))}
        </CarouselContent>
      </Carousel>

      <LoginPromptDialog
        open={isLoginPromptOpen}
        onOpenChange={setIsLoginPromptOpen}
        action="favorite"
      />
    </section>
  );
};

export default ProductCarousel;
