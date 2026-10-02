import { useState, useMemo, useEffect } from 'react';
import { Flower2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@components/ui/carousel';
import { Skeleton } from '@components/ui/skeleton';
import { cn } from '@/lib/utils';

export type ProductGalleryProps = {
  images?: string[];
  productName: string;
  hasDiscount?: boolean;
  discountPercentage?: number;
  className?: string;
};

export const ProductGallery = ({
  images,
  productName,
  hasDiscount = false,
  discountPercentage = 0,
  className,
}: ProductGalleryProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadedMap, setLoadedMap] = useState<Record<number, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<number, boolean>>({});

  const galleryList = useMemo(() => {
    return images?.filter(Boolean) || [];
  }, [images]);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    api.on('reInit', onSelect);

    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  const handleSelectThumbnail = (index: number) => {
    setSelectedIndex(index);
    api?.scrollTo(index);
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3.5 w-full min-w-0 lg:h-full lg:justify-between',
        className
      )}
    >
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
          align: 'center',
          skipSnaps: true,
          duration: 20,
        }}
        className="group relative w-full aspect-4/3 lg:min-h-0 lg:grow bg-[#fcfdfb] border border-border rounded-[20px] overflow-hidden shadow-xs"
      >
        {hasDiscount && discountPercentage > 0 && (
          <div className="absolute top-4 left-4 z-20 bg-[#FA1105] text-white text-[13px] font-bold tracking-tight rounded-[8px] px-3 py-1 shadow-xs pointer-events-none">
            Sale −{discountPercentage}%
          </div>
        )}

        {galleryList.length > 1 && (
          <>
            <CarouselPrevious className="left-3.5 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white/90 hover:bg-white text-[#0C0C0C] shadow-md transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer border border-border/50 select-none touch-manipulation [&_svg]:size-5 [&_svg]:stroke-2" />
            <CarouselNext className="right-3.5 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white/90 hover:bg-white text-[#0C0C0C] shadow-md transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer border border-border/50 select-none touch-manipulation [&_svg]:size-5 [&_svg]:stroke-2" />
          </>
        )}

        {galleryList.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 text-text-muted p-8 text-center size-full">
            <Flower2 className="size-16 stroke-[1.2] text-primary/40" />
            <span className="text-sm font-medium">{productName}</span>
          </div>
        ) : (
          <CarouselContent className="-ml-0 h-full cursor-grab active:cursor-grabbing">
            {galleryList.map((imgUrl, idx) => {
              const isLoaded = loadedMap[idx];
              const hasError = errorMap[idx];

              return (
                <CarouselItem
                  key={`${imgUrl}-${idx}`}
                  className="pl-0 basis-full h-full relative select-none"
                >
                  {!isLoaded && !hasError && (
                    <Skeleton className="absolute inset-0 size-full rounded-none" />
                  )}

                  {hasError ? (
                    <div className="flex flex-col items-center justify-center gap-2 text-text-muted p-8 text-center size-full">
                      <Flower2 className="size-14 stroke-[1.2] text-primary/40" />
                      <span className="text-sm font-medium">{productName}</span>
                    </div>
                  ) : (
                    <img
                      src={imgUrl}
                      alt={`${productName} view ${idx + 1}`}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      fetchPriority={idx === 0 ? 'high' : 'low'}
                      decoding="async"
                      onLoad={() =>
                        setLoadedMap(prev => ({ ...prev, [idx]: true }))
                      }
                      onError={() =>
                        setErrorMap(prev => ({ ...prev, [idx]: true }))
                      }
                      className="w-full h-full object-cover"
                    />
                  )}
                </CarouselItem>
              );
            })}
          </CarouselContent>
        )}
      </Carousel>

      {galleryList.length > 1 && (
        <div className="grid grid-cols-4 gap-3 shrink-0">
          {galleryList.map((imgUrl, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={`thumb-${imgUrl}-${idx}`}
                type="button"
                onClick={() => handleSelectThumbnail(idx)}
                className={cn(
                  'relative aspect-4/3 rounded-[14px] overflow-hidden border bg-[#fcfdfb] transition-all cursor-pointer p-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary',
                  isSelected
                    ? 'border-[#3E8D35] ring-2 ring-[#3E8D35]/25 shadow-xs'
                    : 'border-border hover:border-zinc-400 opacity-75 hover:opacity-100'
                )}
                aria-label={`View photo ${idx + 1} of ${productName}`}
              >
                <img
                  src={imgUrl}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
