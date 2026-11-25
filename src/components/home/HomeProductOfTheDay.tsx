import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useGetProductOfTheDay } from '@api/product/product.hooks';
import { Button } from '@components/ui/button';
import { Spinner } from '@components/ui/spinner';
import ImageWithPlaceholder from '@components/common/ImageWithPlaceholder';
import HomeProductPrice from '@components/home/HomeProductPrice';
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
                  <div className="relative aspect-[1.19] w-full max-w-120 overflow-hidden rounded-3xl border border-border bg-card">
                    <ImageWithPlaceholder
                      src={productOfTheDay.imageUrl || ProductOfTheDayImage}
                      alt={productOfTheDay.name}
                      fit="cover"
                      className="absolute inset-0 rounded-none"
                    />
                  </div>
                </div>

                <div className="lg:col-span-6 flex min-w-0 flex-col items-start gap-4">
                  <h3
                    title={productOfTheDay.name}
                    className="w-full min-w-0 line-clamp-3 wrap-anywhere text-2xl sm:text-4xl font-bold text-link-text"
                  >
                    {productOfTheDay.name}
                  </h3>
                  <HomeProductPrice
                    price={productOfTheDay.price}
                    discountPrice={productOfTheDay.discountPrice}
                  />
                  <p
                    title={productOfTheDay.description}
                    className="w-full min-w-0 line-clamp-4 wrap-anywhere text-sm sm:text-base text-[#4A5568] leading-relaxed"
                  >
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
