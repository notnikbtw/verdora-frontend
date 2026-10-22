import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import HeroImage from '@assets/images/hero-plants.webp';
import ProductOfTheDayImage from '@assets/images/plant.png';
import IntegrateSectionImage from '@assets/images/integrate-section.png';
import PlantImage from '@assets/images/Plant1.png';
import DeliveryIcon from '@assets/icons/delivery.svg?react';
import LabelIcon from '@assets/icons/label.svg?react';
import LikeMessageIcon from '@assets/icons/like-message.svg?react';
import PlantIcon from '@assets/icons/plant.svg?react';
import { Button } from '@/components/ui/button';
import FrameIcon from '@assets/icons/frame.svg?react';
import { Star, Sparkles, PackageX, AlertCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
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
import ImageWithPlaceholder from '@components/common/ImageWithPlaceholder';
import SectionLayout from '@components/common/section/SectionLayout';
import ReviewsCarousel from '@components/home/ReviewsCarousel';
import { HOTSPOTS } from '@/config/home.config';
import CatalogProductCardSkeleton from '@/components/catalog/CatalogProductCardSkeleton';

export const Home = () => {
  const { data: categories, isLoading: isCategoriesLoading } =
    useAllCategories();
  const categoryMap = useMemo(
    () =>
      new Map(categories?.map(cat => [Number(cat.categoryId), cat.name]) || []),
    [categories]
  );
  const { data: products, isLoading: isProductsLoading } = useGetProducts();
  const { data: salesProducts, isLoading: isSalesLoading } = useGetProducts({
    discount: true,
  });
  const { data: productOfTheDay, isLoading: isProductOfTheDayLoading } =
    useGetProductOfTheDay();

  const hotspot1Query = useGetProductById(HOTSPOTS[0]?.productId);
  const hotspot2Query = useGetProductById(HOTSPOTS[1]?.productId);

  const isHotspot1NotFound = hotspot1Query.error?.response?.status === 404;
  const isHotspot2NotFound = hotspot2Query.error?.response?.status === 404;

  const visibleHotspots = HOTSPOTS.filter(spot => {
    if (spot.productId === HOTSPOTS[0]?.productId) return !isHotspot1NotFound;
    if (spot.productId === HOTSPOTS[1]?.productId) return !isHotspot2NotFound;
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
    activeProductId === HOTSPOTS[1]?.productId ? hotspot2Query : hotspot1Query;

  const selectedProduct = currentProductQuery.data;
  const isSelectedProductLoading = currentProductQuery.isLoading;
  const isSelectedProductError = currentProductQuery.isError;
  const selectedProductError = currentProductQuery.error;
  const refetchSelectedProduct = currentProductQuery.refetch;
  const isSelectedProductPanelLoading =
    isProductsLoading || isSelectedProductLoading;

  const selectedProductPrice =
    selectedProduct?.discountPrice &&
    selectedProduct.discountPrice < selectedProduct.price
      ? selectedProduct.discountPrice
      : selectedProduct?.price;

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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8">
              {isProductOfTheDayLoading ? (
                <>
                  <div className="lg:col-span-6 flex justify-center w-full">
                    <div className="relative aspect-[1.19] w-full max-w-120 p-4 sm:p-6 flex items-center justify-center">
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
                  <div className="lg:col-span-6 flex min-w-0 justify-center w-full">
                    <div className="relative aspect-[1.19] w-full max-w-120 p-4 sm:p-6">
                      <FrameIcon className="pointer-events-none absolute inset-0 z-20 size-full" />
                      <div className="relative z-10 size-full overflow-hidden flex items-center justify-center p-4">
                        <img
                          src={productOfTheDay.imageUrl || ProductOfTheDayImage}
                          alt={productOfTheDay.name}
                          onError={e => {
                            (e.currentTarget as HTMLImageElement).src =
                              ProductOfTheDayImage;
                          }}
                          className="size-full object-contain p-4 transition-transform duration-500 hover:scale-104 bg-[#50614A] rounded-[48px] sm:rounded-[70px]"
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

                  <div className="lg:col-span-6 flex min-w-0 flex-col items-start gap-4">
                    <h3 className="w-full min-w-0 wrap-break-word text-2xl sm:text-4xl font-bold text-link-text">
                      {productOfTheDay.name}
                    </h3>
                    <p className="w-full min-w-0 wrap-break-word text-sm sm:text-base text-[#4A5568] leading-relaxed">
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
          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[3fr_1fr]">
            <div className="group relative aspect-361/299 overflow-hidden rounded-3xl lg:h-120 lg:aspect-auto">
              <img
                src={IntegrateSectionImage}
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
                      'absolute flex size-12 items-center justify-center rounded-full text-white transition-all cursor-pointer bg-[#6A7B66]/80 backdrop-blur-md lg:size-14',
                      spot.className,
                      isSelected
                        ? 'ring-4 ring-white/90 scale-110 shadow-xl bg-[#23511E]'
                        : 'hover:scale-110 opacity-90 hover:opacity-100'
                    )}
                    aria-label={`View plant ${spot.label}`}
                    aria-pressed={isSelected}
                  >
                    <Plus
                      className="size-6 lg:size-8"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>

            <div className="flex h-full min-w-0 flex-col">
              {isSelectedProductPanelLoading ? (
                <CatalogProductCardSkeleton
                  viewMode="grid"
                  count={1}
                  className="size-full"
                />
              ) : selectedProduct && !isSelectedProductError ? (
                <div className="flex h-full flex-col justify-between rounded-[32px] bg-white p-6 shadow-sm lg:p-7">
                  <h3 className="text-center text-2xl font-bold tracking-tight text-[#0C0C0C] lg:text-3xl">
                    {selectedProduct.name}
                  </h3>

                  <div className="relative my-auto flex w-full flex-1 items-center justify-center py-4">
                    <ImageWithPlaceholder
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      placeholderLabel={
                        categoryMap.get(selectedProduct.categoryId) ||
                        'Verdora Plant'
                      }
                      className="h-auto aspect-square max-h-72 w-full rounded-2xl"
                      imageClassName="h-auto max-h-72 w-full object-contain"
                    />

                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-[#0C0C0C] px-7 py-3 text-2xl font-bold leading-none text-white shadow-lg lg:text-3xl">
                      {selectedProductPrice}₴
                    </span>
                  </div>

                  <Button
                    type="button"
                    className="h-13 w-full rounded-full bg-[#23511E] text-base font-semibold text-white transition-colors hover:bg-[#1b4017] disabled:opacity-50"
                    asChild
                  >
                    <Link to={`/products/${selectedProduct.productId}`}>
                      View product
                    </Link>
                  </Button>
                </div>
              ) : isSelectedProductError &&
                selectedProductError?.response?.status !== 404 ? (
                <div className="flex h-full flex-col items-center justify-between rounded-[32px] bg-white p-6 text-center shadow-sm">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-red-700 sm:text-2xl">
                      Failed to load
                    </h3>
                    <p className="text-sm text-[#4A5568]">
                      Unable to connect to the server.
                    </p>
                  </div>
                  <div className="relative z-10 flex h-48 w-full flex-col items-center justify-center gap-3">
                    <div className="relative flex size-24 items-center justify-center rounded-full border border-red-200 bg-red-50">
                      <AlertCircle className="size-10 text-red-500" />
                    </div>
                    <span className="rounded-xl bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700">
                      Connection error
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => refetchSelectedProduct()}
                    className="w-full cursor-pointer px-8"
                  >
                    Try again
                  </Button>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-between rounded-[32px] bg-white p-6 text-center shadow-sm">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-link-text sm:text-2xl">
                      Product not found
                    </h3>
                    <p className="text-sm text-[#4A5568]">
                      This product does not exist in the catalog
                    </p>
                  </div>
                  <div className="relative z-10 flex h-48 w-full flex-col items-center justify-center gap-3">
                    <div className="relative flex size-24 items-center justify-center rounded-full border border-[#1E331B]/10 bg-[#1E331B]/5">
                      <img
                        src={PlantImage}
                        alt="Product not found"
                        className="size-16 object-contain opacity-35 grayscale"
                      />
                      <div className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-white bg-zinc-100 text-zinc-600 shadow-xs">
                        <PackageX className="size-3.5" />
                      </div>
                    </div>
                    <span className="rounded-xl bg-zinc-200/80 px-4 py-1.5 text-sm font-semibold text-zinc-600">
                      Not found
                    </span>
                  </div>
                  <Button variant="outline" asChild className="w-full px-8">
                    <Link to="/catalog">Browse catalog</Link>
                  </Button>
                </div>
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
          <ReviewsCarousel>
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
          </ReviewsCarousel>
        </SectionLayout>
      </div>
    </LayoutPage>
  );
};

export default Home;
