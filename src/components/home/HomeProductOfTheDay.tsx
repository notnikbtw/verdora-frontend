import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useGetProductOfTheDay } from '@api/product/product.hooks';
import { Button } from '@components/ui/button';
import { Spinner } from '@components/ui/spinner';
import { formatCurrency } from '@/utils/order.utils';
import ProductOfTheDayImage from '@assets/images/plant.webp';

const HomeProductOfTheDay = () => {
  const { data: productOfTheDay, isLoading: isProductOfTheDayLoading } =
    useGetProductOfTheDay();
  return (
    <>
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
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-[5%] z-20 rounded-[19%] border-2 border-[#50614A] sm:border-4"
                    />
                    <div className="relative z-10 size-full overflow-hidden flex items-center justify-center p-4">
                      <img
                        src={productOfTheDay.imageUrl || ProductOfTheDayImage}
                        alt={productOfTheDay.name}
                        loading="lazy"
                        decoding="async"
                        onError={e => {
                          if (
                            !e.currentTarget.src.endsWith(ProductOfTheDayImage)
                          ) {
                            e.currentTarget.src = ProductOfTheDayImage;
                          }
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
                              {formatCurrency(productOfTheDay.discountPrice)}
                            </span>
                            <span className="rounded-lg bg-link-text/70 lg:backdrop-blur-xs px-2.5 py-1 text-sm sm:text-base text-white line-through">
                              {formatCurrency(productOfTheDay.price)}
                            </span>
                          </>
                        ) : (
                          <span className="rounded-xl bg-link-text px-5 py-2 text-xl sm:text-2xl font-bold text-white">
                            {formatCurrency(productOfTheDay.price)}
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
    </>
  );
};

export default HomeProductOfTheDay;
