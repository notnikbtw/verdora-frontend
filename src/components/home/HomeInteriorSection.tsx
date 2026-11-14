import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, PackageX, Plus } from 'lucide-react';
import { useGetProductById } from '@api/product/product.hooks';
import { useCategoryById } from '@api/category/category.hooks';
import { HOTSPOTS } from '@/config/home.config';
import { formatCurrency } from '@/utils/order.utils';
import { cn } from '@/lib/utils';
import { Button } from '@components/ui/button';
import ImageWithPlaceholder from '@components/common/ImageWithPlaceholder';
import SectionLayout from '@components/common/section/SectionLayout';
import CatalogProductCardSkeleton from '@components/catalog/CatalogProductCardSkeleton';
import IntegrateSectionImage from '@assets/images/integrate-section-1024.webp';
import IntegrateSmall from '@assets/images/integrate-section-480.webp';
import IntegrateMedium from '@assets/images/integrate-section-960.webp';
import PlantImage from '@assets/images/plant-placeholder.webp';

const HomeInteriorSection = () => {
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
  const isSelectedProductPanelLoading = isSelectedProductLoading;

  const selectedProductPrice =
    selectedProduct?.discountPrice &&
    selectedProduct.discountPrice < selectedProduct.price
      ? selectedProduct.discountPrice
      : selectedProduct?.price;

  const { data: category } = useCategoryById(selectedProduct?.categoryId ?? 0);

  return (
    <SectionLayout title="Integrate in your house">
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[3fr_1fr]">
        <div className="group relative aspect-361/299 overflow-hidden rounded-3xl lg:h-120 lg:aspect-auto">
          <img
            src={IntegrateSectionImage}
            srcSet={`${IntegrateSmall} 480w, ${IntegrateMedium} 960w, ${IntegrateSectionImage} 1024w`}
            sizes="(min-width: 1024px) 72vw, calc(100vw - 2rem)"
            width={1024}
            height={420}
            loading="lazy"
            decoding="async"
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
                  'absolute flex size-12 items-center justify-center rounded-full text-white transition-all cursor-pointer bg-[#6A7B66]/80 lg:backdrop-blur-md lg:size-14',
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
              <h3 className="text-center text-lg lg:text-2xl font-bold tracking-tight text-[#0C0C0C]">
                {selectedProduct.name}
              </h3>

              <div className="relative my-auto flex w-full flex-1 items-center justify-center py-4">
                <ImageWithPlaceholder
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  placeholderLabel={category?.name || 'Verdora Plant'}
                  className="h-auto aspect-square max-h-72 w-full rounded-2xl"
                  fit="contain"
                />

                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-[#0C0C0C] px-7 py-3 text-2xl font-bold leading-none text-white shadow-lg lg:text-3xl">
                  {formatCurrency(selectedProductPrice)}
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
                    width={128}
                    height={118}
                    loading="lazy"
                    decoding="async"
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
  );
};

export default HomeInteriorSection;
