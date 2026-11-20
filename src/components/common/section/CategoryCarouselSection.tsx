import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Sprout,
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@components/ui/carousel';
import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';
import ImageWithPlaceholder from '@components/common/ImageWithPlaceholder';
import ErrorSection from '@components/common/section/ErrorSection';
import { useCarouselAutoplay } from '@hooks/useCarouselAutoplay';
import { cn } from '@/lib/utils';
import { CATEGORY_ROTATION_DELAY_MS } from '@/config/home.config';
import type { Category } from '@/types/category';

type Props = {
  categories: Category[];
  totalCategories?: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  isLoadMoreError: boolean;
  onLoadMore: () => void;
};

const CategoryCarouselSection = ({
  categories,
  totalCategories,
  isLoading,
  isError,
  onRetry,
  hasMore,
  isLoadingMore,
  isLoadMoreError,
  onLoadMore,
}: Props) => {
  const rootRef = useRef<HTMLElement>(null);
  const [api, setApi] = useState<CarouselApi>();
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!api) return () => {};
      api.on('select', onChange);
      api.on('reInit', onChange);
      return () => {
        api.off('select', onChange);
        api.off('reInit', onChange);
      };
    },
    [api]
  );
  const selected = useSyncExternalStore(
    subscribe,
    () => api?.selectedScrollSnap() ?? 0,
    () => 0
  );
  const autoplay = useCarouselAutoplay(
    api,
    rootRef,
    categories.length > 1 && !isLoadingMore,
    CATEGORY_ROTATION_DELAY_MS
  );

  const loadMoreNearEnd = useCallback(
    (index: number) => {
      if (
        categories.length &&
        index >= categories.length - 4 &&
        hasMore &&
        !isLoadingMore &&
        !isLoadMoreError
      )
        onLoadMore();
    },
    [categories.length, hasMore, isLoadingMore, isLoadMoreError, onLoadMore]
  );

  useEffect(() => {
    if (!api) return;
    const loadAfterSwipe = () => loadMoreNearEnd(api.selectedScrollSnap());
    api.on('pointerUp', loadAfterSwipe);
    return () => {
      api.off('pointerUp', loadAfterSwipe);
    };
  }, [api, loadMoreNearEnd]);

  const scroll = (direction: 'previous' | 'next') => {
    autoplay.setPaused(true);
    if (!api) return;
    if (direction === 'previous') {
      if (api.canScrollPrev()) api.scrollPrev(autoplay.reducedMotion);
      else if (!hasMore)
        api.scrollTo(categories.length - 1, autoplay.reducedMotion);
    } else {
      if (api.canScrollNext()) api.scrollNext(autoplay.reducedMotion);
      else if (!hasMore) api.scrollTo(0, autoplay.reducedMotion);
    }
    loadMoreNearEnd(api.selectedScrollSnap());
  };
  const total = totalCategories ?? categories.length;

  return (
    <section
      ref={rootRef}
      aria-labelledby="home-categories-title"
      aria-busy={isLoading || isLoadingMore}
      className="w-full min-w-0"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2
            id="home-categories-title"
            className="font-heading text-2xl font-semibold text-link-text sm:text-3xl"
          >
            Categories
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Find something new for your garden.
          </p>
        </div>
        <Button asChild variant="outline" size="touch">
          <Link to="/catalog">
            Browse catalog
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </header>

      {isLoading ? (
        <div
          aria-label="Loading categories"
          className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3"
        >
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              key={index}
              className={cn(
                'h-72 rounded-3xl',
                index !== 1 && 'hidden sm:block sm:scale-95'
              )}
            />
          ))}
        </div>
      ) : isError && !categories.length ? (
        <ErrorSection
          title="Unable to load categories"
          message="Please try again to explore our collections."
          onRetry={onRetry}
        />
      ) : !categories.length ? (
        <div className="mt-6 rounded-3xl border border-border bg-card p-10 text-center">
          <Sprout
            aria-hidden="true"
            className="mx-auto mb-3 size-10 text-primary"
          />
          <p className="text-muted-foreground">
            New categories are on their way. Explore the catalog in the
            meantime.
          </p>
        </div>
      ) : (
        <div>
          <div
            onPointerEnter={event => {
              if (event.pointerType === 'mouse') autoplay.setHovered(true);
            }}
            onPointerLeave={() => autoplay.setHovered(false)}
            onFocusCapture={() => autoplay.setFocused(true)}
            onBlurCapture={event => {
              if (!event.currentTarget.contains(event.relatedTarget))
                autoplay.setFocused(false);
            }}
          >
            <Carousel
              setApi={setApi}
              opts={{ align: 'center', loop: !hasMore, containScroll: false }}
              onKeyDownCapture={event => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                  event.preventDefault();
                  scroll(event.key === 'ArrowLeft' ? 'previous' : 'next');
                }
              }}
              aria-label="Browse categories"
              className="mt-2 w-full min-w-0"
            >
              <CarouselContent
                className="ml-0 py-6"
                wrapperClassName="rounded-3xl"
              >
                {categories.map((category, index) => (
                  <CarouselItem
                    key={category.categoryId}
                    className="basis-[82%] pl-0 sm:basis-[45%] lg:basis-1/3"
                    aria-label={`${index + 1} of ${total}`}
                  >
                    <Link
                      to={`/catalog?category=${category.categoryId}`}
                      title={category.name}
                      aria-label={`Browse ${category.name}`}
                      data-category-id={category.categoryId}
                      data-current={selected === index}
                      className={cn(
                        'group mx-2 block min-w-0 rounded-3xl border bg-card p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-safe:transition-[transform,box-shadow,opacity] motion-safe:duration-500',
                        selected === index
                          ? 'scale-100 border-primary/50 shadow-lg'
                          : 'scale-90 border-border opacity-80 hover:opacity-100'
                      )}
                    >
                      <ImageWithPlaceholder
                        src={category.imageUrl}
                        alt={category.name}
                        className="aspect-4/3 h-auto rounded-2xl"
                        zoomOnHover
                      />
                      <div className="mt-4 flex min-w-0 items-center gap-3 px-1 pb-1">
                        <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground sm:text-lg">
                          {category.name}
                        </h3>
                        <span
                          className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-full',
                            selected === index
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-primary'
                          )}
                        >
                          <ArrowRight aria-hidden="true" className="size-5" />
                        </span>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {categories.length > 1 && (
            <div className="flex items-center justify-between gap-3">
              {!autoplay.reducedMotion ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="touch"
                  onClick={() => autoplay.setPaused(value => !value)}
                  aria-label={
                    autoplay.paused
                      ? 'Start automatic category rotation'
                      : 'Pause automatic category rotation'
                  }
                >
                  {autoplay.paused ? (
                    <Play aria-hidden="true" className="size-4" />
                  ) : (
                    <Pause aria-hidden="true" className="size-4" />
                  )}
                  {autoplay.paused ? 'Play' : 'Pause'}
                </Button>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Categories
                </span>
              )}
              <p
                aria-live={autoplay.rotating ? 'off' : 'polite'}
                aria-atomic="true"
                className="whitespace-nowrap text-sm tabular-nums text-muted-foreground"
              >
                <span className="font-semibold text-foreground">
                  {Math.min(selected + 1, categories.length)}
                </span>{' '}
                / {total}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="touch"
                  className="size-11 p-0"
                  aria-label="Previous category"
                  disabled={!api || (hasMore && selected === 0)}
                  onClick={() => scroll('previous')}
                >
                  <ChevronLeft aria-hidden="true" className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="touch"
                  className="size-11 p-0"
                  aria-label="Next category"
                  disabled={
                    !api || (hasMore && selected === categories.length - 1)
                  }
                  onClick={() => scroll('next')}
                >
                  <ChevronRight aria-hidden="true" className="size-5" />
                </Button>
              </div>
            </div>
          )}
          <div className="mt-3 min-h-6 text-center text-sm text-muted-foreground">
            {isLoadingMore && <p role="status">Loading more categories…</p>}
            {isLoadMoreError && (
              <p role="status">
                More categories couldn’t be loaded.{' '}
                <Button variant="link" onClick={onLoadMore}>
                  Try again
                </Button>
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default CategoryCarouselSection;
