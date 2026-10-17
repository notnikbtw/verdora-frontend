import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import HeroImage from '@assets/images/hero-plants.webp';
import ProductOfTheDayImage from '@assets/images/plant.png';
import SectionImage from '@assets/images/section-background.png';
import PlantImage from '@assets/images/Plant1.png';
import DeliveryIcon from '@assets/icons/delivery.svg?react';
import LabelIcon from '@assets/icons/label.svg?react';
import LikeMessageIcon from '@assets/icons/like-message.svg?react';
import PlantIcon from '@assets/icons/plant.svg?react';
import { Button } from '@/components/ui/button';
import FrameIcon from '@assets/icons/frame.svg?react';
import { Star, Sparkles, PackageX, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAppSelector } from '@api/hooks';
import { useAllCategories } from '@api/category/category.hooks';
import {
  useGetProducts,
  useGetProductById,
  useGetProductOfTheDay,
} from '@api/product/product.hooks';
import { Spinner } from '@components/ui/spinner';
import { cn } from '@/lib/utils';
import ProductGridSection from '@components/common/section/ProductGridSection';
import CategoryGridSection from '@components/common/section/CategoryGridSection';
import SectionLayout from '@components/common/section/SectionLayout';
import CatalogProductCard from '@components/catalog/CatalogProductCard';
import CatalogProductCardSkeleton from '@/components/catalog/CatalogProductCardSkeleton';
import LoginPromptDialog from '@components/common/dialog/LoginPromptDialog';
import { useToggleFavorite } from '@hooks/useToggleFavorite';
import { useAddProductToCart } from '@hooks/useAddProductToCart';

// Interior plant hotspots matching plants in section-background.png:
// - Hotspot 19: Rubber Plant (ficus on the left)
// - Hotspot 20: Rose (on the table)
const HOTSPOTS = [
  {
    productId: 19,
    className: 'bottom-[22%] left-[23%]',
    label: 'Rubber Plant',
  },
  {
    productId: 20,
    className: 'bottom-[31%] left-[49%]',
    label: 'Rose',
  },
];

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);

  const { addToCart, isAddingToCart } = useAddProductToCart();
  const { data: categories, isLoading: isCategoriesLoading } =
    useAllCategories();
  const categoryMap = useMemo(
    () => new Map(categories.map(cat => [Number(cat.categoryId), cat.name])),
    [categories]
  );
  const { data: products, isLoading: isProductsLoading } = useGetProducts();
  const { data: salesProducts, isLoading: isSalesLoading } = useGetProducts({
    discount: true,
  });
  const { data: productOfTheDay, isLoading: isProductOfTheDayLoading } =
    useGetProductOfTheDay();

  const hotspot1Query = useGetProductById(HOTSPOTS[0].productId);
  const hotspot2Query = useGetProductById(HOTSPOTS[1].productId);

  const isHotspot1NotFound = hotspot1Query.error?.response?.status === 404;
  const isHotspot2NotFound = hotspot2Query.error?.response?.status === 404;

  const visibleHotspots = HOTSPOTS.filter(spot => {
    if (spot.productId === HOTSPOTS[0].productId) return !isHotspot1NotFound;
    if (spot.productId === HOTSPOTS[1].productId) return !isHotspot2NotFound;
    return true;
  });

  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const activeProductId =
    selectedProductId &&
    visibleHotspots.some(h => h.productId === selectedProductId)
      ? selectedProductId
      : visibleHotspots[0]?.productId;

  const currentProductQuery =
    activeProductId === HOTSPOTS[1].productId ? hotspot2Query : hotspot1Query;

  const selectedProduct = currentProductQuery.data;
  const isSelectedProductLoading = currentProductQuery.isLoading;
  const isSelectedProductError = currentProductQuery.isError;
  const selectedProductError = currentProductQuery.error;
  const refetchSelectedProduct = currentProductQuery.refetch;
  const isSelectedProductPanelLoading =
    isProductsLoading || isSelectedProductLoading;
  const showSelectedProductCard =
    isSelectedProductPanelLoading ||
    Boolean(selectedProduct && !isSelectedProductError);

  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const { isFavorite, isFavoritePending, toggleFavorite } = useToggleFavorite({
    onAuthRequired: () => setIsLoginPromptOpen(true),
  });
  const { addToCart: addSelectedProductToCart } = useAddProductToCart();

  const handleBuyNow = (productId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(productId, 1, {
      onSuccess: () => {
        navigate('/cart');
      },
    });
  };

  const reviews = [
    {
      text: 'Fast delivery and beautiful plants. Highly recommend Verdora!',
      name: 'Bill Afton',
      rating: '4.0/5',
      initials: 'BA',
    },
    {
      text: 'Excellent quality and friendly service. Very happy with my order.',
      name: 'Amily Grenshy',
      rating: '4.9/5',
      initials: 'AG',
    },
    {
      text: 'Everything arrived fresh and in perfect condition. Thank you!',
      name: 'Omar Kirik',
      rating: '4.5/5',
      initials: 'OK',
    },
    {
      text: 'Amazing selection of plants and gardening supplies. Love this shop!',
      name: 'Greg Harigton',
      rating: '4.9/5',
      initials: 'GH',
    },
    {
      text: 'The plant was packed carefully and looks wonderful at home.',
      name: 'Mia Brown',
      rating: '5.0/5',
      initials: 'MB',
    },
  ];

  return (
    <LayoutPage>
      <div className="mt-8 sm:mt-16 flex flex-col items-center gap-16 sm:gap-24 w-full pb-16">
        <section className="flex flex-col items-center text-center w-full max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-6 w-full">
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] sm:leading-[0.98]
                tracking-tight text-transparent
                bg-[url('@assets/images/text-background.avif')] bg-cover bg-center bg-clip-text
                font-sans max-w-3xl"
            >
              We're glad you found us. Now let's find your plant!
            </h1>
            <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-[#4A5568] max-w-2xl">
              Your home deserves more than furniture and paint. It deserves life
              — real, breathing, growing life. Our collection brings together
              the most beautiful plants from around the world.
            </p>
            <Button asChild>
              <Link to="/catalog">Start shopping</Link>
            </Button>
          </div>
          <div className="relative z-10 -mt-12 sm:-mt-24 max-w-3xl w-full pointer-events-none transition-transform hover:scale-[1.01] duration-500">
            <img
              src={HeroImage}
              alt="Hero Plants"
              className="w-full h-auto object-contain"
            />
          </div>
        </section>

        <section className="w-full bg-[#1E331B] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center text-white">
            <div className="flex flex-col items-center text-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-colors duration-300">
              <DeliveryIcon className="size-8 text-[#A8C89A]" />
              <p className="text-xs sm:text-sm font-medium leading-snug">
                Shipped Direct from the Nursery
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-colors duration-300">
              <LabelIcon className="size-8 text-[#A8C89A]" />
              <p className="text-xs sm:text-sm font-medium leading-snug">
                30 Day Happiness Guarantee
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-colors duration-300">
              <LikeMessageIcon className="size-8 text-[#A8C89A]" />
              <p className="text-xs sm:text-sm font-medium leading-snug">
                Expert Customer Support
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-colors duration-300">
              <PlantIcon className="size-8 text-[#A8C89A]" />
              <p className="text-xs sm:text-sm font-medium leading-snug">
                Care Instructions Provided
              </p>
            </div>
          </div>
        </section>

        {Boolean(isProductOfTheDayLoading || productOfTheDay) && (
          <section className="flex flex-col gap-6 w-full">
            <div className="flex items-center gap-3">
              <Sparkles className="size-6 text-[#1E331B]" />
              <h2 className="text-2xl sm:text-3xl font-bold text-link-text">
                Product of the day
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/80 shadow-xs hover:shadow-md transition-all duration-300">
              {isProductOfTheDayLoading ? (
                <>
                  <div className="lg:col-span-6 flex justify-center w-full">
                    <div className="relative aspect-[1.19] w-full max-w-[480px] p-4 sm:p-6 flex items-center justify-center">
                      <Spinner className="size-8 text-[#1E331B]" />
                    </div>
                  </div>
                  <div className="lg:col-span-6 flex flex-col items-start gap-4">
                    <div className="h-6 w-28 bg-zinc-200/80 rounded-full animate-pulse" />
                    <div className="h-10 w-64 bg-zinc-200/80 rounded-lg animate-pulse" />
                    <div className="h-20 w-full bg-zinc-200/80 rounded-lg animate-pulse" />
                    <div className="h-10 w-32 bg-zinc-200/80 rounded-xl animate-pulse" />
                  </div>
                </>
              ) : productOfTheDay ? (
                <>
                  <div className="lg:col-span-6 flex justify-center w-full">
                    <div className="relative aspect-[1.19] w-full max-w-[480px] p-4 sm:p-6">
                      <FrameIcon className="pointer-events-none absolute inset-0 z-20 size-full" />
                      <div className="relative z-10 size-full overflow-hidden rounded-[48px] sm:rounded-[70px] bg-[#50614A] flex items-center justify-center p-4">
                        <img
                          src={productOfTheDay.imageUrl || ProductOfTheDayImage}
                          alt={productOfTheDay.name}
                          onError={e => {
                            (e.currentTarget as HTMLImageElement).src =
                              ProductOfTheDayImage;
                          }}
                          className="size-full object-contain p-4 transition-transform duration-500 hover:scale-105"
                        />
                        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap shadow-lg">
                          {productOfTheDay.discountPrice &&
                          productOfTheDay.discountPrice > 0 &&
                          productOfTheDay.discountPrice <
                            productOfTheDay.price ? (
                            <>
                              <span className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xl sm:text-2xl font-bold text-white">
                                {productOfTheDay.discountPrice}₴
                              </span>
                              <span className="rounded-lg bg-link-text/70 backdrop-blur-xs px-2.5 py-1 text-sm sm:text-base text-white line-through">
                                {productOfTheDay.price}₴
                              </span>
                            </>
                          ) : (
                            <span className="rounded-xl bg-link-text px-5 py-2 text-xl sm:text-2xl font-bold text-white">
                              {productOfTheDay.price}₴
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 flex flex-col items-start gap-4">
                    <span className="inline-flex items-center rounded-full bg-[#1E331B]/10 px-3 py-1 text-xs font-semibold text-[#1E331B]">
                      Deal of the Day
                    </span>
                    <h3 className="text-2xl sm:text-4xl font-bold text-link-text">
                      {productOfTheDay.name}
                    </h3>
                    <p className="text-sm sm:text-base text-[#4A5568] leading-relaxed">
                      {productOfTheDay.description}
                    </p>
                    <Button asChild>
                      <Link to={`/products/${productOfTheDay.productId}`}>
                        View product
                      </Link>
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          </section>
        )}

        <ProductGridSection
          title="Sales"
          viewAllLink="/catalog?discount=true"
          products={salesProducts?.content}
          isLoading={isSalesLoading}
          limit={8}
          categoryMap={categoryMap}
          emptyTitle="No sales products found"
          emptyDescription="There are no discounted products available at the moment."
        />

        <SectionLayout title="Integrate in your house">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 relative aspect-4/3 sm:aspect-16/10 overflow-hidden rounded-3xl shadow-xs group">
              <img
                src={SectionImage}
                alt="Cozy living room with houseplants"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-102"
              />
              {visibleHotspots.map(spot => {
                const isSelected = activeProductId === spot.productId;
                return (
                  <button
                    key={spot.productId}
                    type="button"
                    onClick={() => setSelectedProductId(spot.productId)}
                    className={cn(
                      'absolute flex size-12 sm:size-14 items-center justify-center rounded-full backdrop-blur-xs text-3xl font-light leading-none text-white transition-all shadow-lg cursor-pointer',
                      spot.className,
                      isSelected
                        ? 'bg-[#1E331B] ring-4 ring-white/90 scale-110 shadow-xl'
                        : 'bg-[#1E331B]/80 hover:scale-110 hover:bg-[#1E331B] opacity-90 hover:opacity-100'
                    )}
                    aria-label={`View plant ${spot.label}`}
                    aria-pressed={isSelected}
                  >
                    +
                  </button>
                );
              })}
            </div>

            <div
              className={cn(
                'lg:col-span-4 flex flex-col items-center gap-4',
                showSelectedProductCard
                  ? 'justify-center'
                  : 'justify-between gap-6 rounded-3xl bg-white/70 backdrop-blur-sm border border-white/80 p-6 text-center shadow-xs min-h-95'
              )}
            >
              {isSelectedProductPanelLoading ? (
                <CatalogProductCardSkeleton
                  viewMode="grid"
                  count={1}
                  className="w-full"
                />
              ) : selectedProduct && !isSelectedProductError ? (
                <>
                  <CatalogProductCard
                    product={selectedProduct}
                    categoryName={categoryMap.get(selectedProduct.categoryId)}
                    viewMode="grid"
                    isFavorite={isFavorite(selectedProduct.productId)}
                    isFavoritePending={isFavoritePending(
                      selectedProduct.productId
                    )}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={addSelectedProductToCart}
                    onAuthRequired={() => setIsLoginPromptOpen(true)}
                    className="w-full"
                  />
                  <Button
                    type="button"
                    className="w-full cursor-pointer"
                    onClick={() => handleBuyNow(selectedProduct.productId)}
                    disabled={isAddingToCart}
                  >
                    {isAddingToCart ? 'Adding...' : 'Buy now'}
                  </Button>
                </>
              ) : isSelectedProductError &&
                selectedProductError?.response?.status !== 404 ? (
                <>
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-red-700">
                      Failed to load
                    </h3>
                    <p className="text-sm text-[#4A5568]">
                      Unable to connect to the server. Please try again.
                    </p>
                  </div>
                  <div className="relative z-10 w-full h-56 flex flex-col items-center justify-center gap-3">
                    <div className="relative flex size-28 items-center justify-center rounded-full bg-red-50 border border-red-200">
                      <AlertCircle className="size-12 text-red-500" />
                    </div>
                    <span className="rounded-xl bg-red-100 text-red-700 px-4 py-1.5 text-sm font-semibold">
                      Connection error
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => refetchSelectedProduct()}
                    className="w-full sm:w-auto px-8 cursor-pointer"
                  >
                    Try again
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-link-text">
                      Product not found
                    </h3>
                    <p className="text-sm text-[#4A5568]">
                      This product does not exist in the catalog
                    </p>
                  </div>
                  <div className="relative z-10 w-full h-56 flex flex-col items-center justify-center gap-3">
                    <div className="relative flex size-28 items-center justify-center rounded-full bg-[#1E331B]/5 border border-[#1E331B]/10">
                      <img
                        src={PlantImage}
                        alt="Product not found"
                        className="size-20 object-contain grayscale opacity-35"
                      />
                      <div className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 border-2 border-white shadow-xs">
                        <PackageX className="size-4" />
                      </div>
                    </div>
                    <span className="rounded-xl bg-zinc-200/80 text-zinc-600 px-4 py-1.5 text-sm font-semibold">
                      Not found
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto px-8"
                  >
                    <Link to="/catalog">Browse catalog</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </SectionLayout>

        <CategoryGridSection
          categories={categories}
          isLoading={isCategoriesLoading}
          limit={6}
        />

        <ProductGridSection
          title="Find your perfect plant"
          viewAllLink="/catalog"
          products={products?.content}
          isLoading={isProductsLoading}
          limit={8}
          categoryMap={categoryMap}
        />

        <SectionLayout title="Our reviews">
          <div
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 no-scrollbar"
            aria-label="Customer reviews"
          >
            {reviews.map(review => (
              <article
                key={review.name}
                className="flex min-w-70 sm:min-w-85 snap-start flex-col justify-between rounded-2xl bg-white/80 backdrop-blur-sm border border-white/80 p-6 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <p className="text-sm sm:text-base leading-relaxed text-[#2C332D] mb-4">
                  "{review.text}"
                </p>
                <div className="flex items-center justify-between gap-4 text-xs sm:text-sm text-[#1E331B] font-medium pt-2 border-t border-black/5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#D9E3D5] text-xs font-bold text-[#1E331B]">
                      {review.initials}
                    </span>
                    <span className="truncate">{review.name}</span>
                  </div>
                  <span className="flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold text-[#B78103]">
                    <Star className="size-3.5 fill-[#FFC400] text-[#FFC400]" />
                    {review.rating}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </SectionLayout>
      </div>

      <LoginPromptDialog
        open={isLoginPromptOpen}
        onOpenChange={setIsLoginPromptOpen}
        action="favorite"
      />
    </LayoutPage>
  );
};

export default Home;
