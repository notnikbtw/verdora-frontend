import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type Key,
  type ReactNode,
} from 'react';
import { ChevronLeft, ChevronRight, Loader2, Pause, Play } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@components/ui/carousel';
import { Button } from '@components/ui/button';
import { useCarouselAutoplay } from '@hooks/useCarouselAutoplay';
import { CAROUSEL_ROTATION_DELAY_MS } from '@/config/home.config';
import { cn } from '@/lib/utils';

type Props<T> = {
  items: T[];
  getKey: (item: T) => Key;
  renderItem: (item: T, active: boolean) => ReactNode;
  label: string;
  previousLabel: string;
  nextLabel: string;
  totalItems?: number;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  isLoadMoreError?: boolean;
  onLoadMore?: () => void;
};

const ContentCarousel = <T,>({
  items,
  getKey,
  renderItem,
  label,
  previousLabel,
  nextLabel,
  totalItems = items.length,
  hasMore = false,
  isLoadingMore = false,
  isLoadMoreError = false,
  onLoadMore,
}: Props<T>) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const pendingAdvance = useRef<{ count: number; index: number } | null>(null);
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
  const snapCount = useSyncExternalStore(
    subscribe,
    () => api?.scrollSnapList().length ?? 0,
    () => 0
  );
  const canRotate = snapCount > 1;
  const autoplay = useCarouselAutoplay(
    api,
    rootRef,
    canRotate && !isLoadingMore,
    CAROUSEL_ROTATION_DELAY_MS
  );

  const loadMoreNearEnd = useCallback(
    (index: number) => {
      if (
        items.length &&
        index >= items.length - 4 &&
        hasMore &&
        !isLoadingMore &&
        !isLoadMoreError
      )
        onLoadMore?.();
    },
    [items.length, hasMore, isLoadingMore, isLoadMoreError, onLoadMore]
  );

  useEffect(() => {
    if (!api) return;
    const loadAfterSwipe = () => {
      pendingAdvance.current = null;
      loadMoreNearEnd(api.selectedScrollSnap());
    };
    api.on('pointerUp', loadAfterSwipe);
    return () => {
      api.off('pointerUp', loadAfterSwipe);
    };
  }, [api, loadMoreNearEnd]);

  useEffect(() => {
    if (!api) return;
    const advanceAfterLoad = () => {
      const pending = pendingAdvance.current;
      // Embla must finish measuring the newly appended slides before scrolling.
      if (
        !pending ||
        items.length <= pending.count ||
        api.slideNodes().length !== items.length
      )
        return;
      pendingAdvance.current = null;
      api.scrollTo(
        Math.min(pending.index, api.scrollSnapList().length - 1),
        autoplay.reducedMotion
      );
    };
    api.on('reInit', advanceAfterLoad);
    advanceAfterLoad();
    return () => {
      api.off('reInit', advanceAfterLoad);
    };
  }, [api, items.length, autoplay.reducedMotion]);

  const scroll = (direction: 'previous' | 'next') => {
    autoplay.setPaused(true);
    pendingAdvance.current = null;
    if (!api) return;
    if (direction === 'previous') {
      if (api.canScrollPrev()) api.scrollPrev(autoplay.reducedMotion);
      else if (!hasMore)
        api.scrollTo(api.scrollSnapList().length - 1, autoplay.reducedMotion);
      else return;
    } else if (api.canScrollNext()) {
      api.scrollNext(autoplay.reducedMotion);
    } else if (hasMore) {
      pendingAdvance.current = { count: items.length, index: selected + 1 };
      if (!isLoadingMore) onLoadMore?.();
      return;
    } else {
      api.scrollTo(0, autoplay.reducedMotion);
    }
    loadMoreNearEnd(api.selectedScrollSnap());
  };

  return (
    <div ref={rootRef} aria-busy={isLoadingMore} className="w-full min-w-0">
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
          opts={{ align: 'center', loop: !hasMore, containScroll: 'keepSnaps' }}
          onKeyDownCapture={event => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              scroll(event.key === 'ArrowLeft' ? 'previous' : 'next');
            }
          }}
          aria-label={label}
          className="w-full min-w-0"
        >
          <CarouselContent
            className={cn(
              'ml-0 py-6',
              items.length === 1 && 'justify-center',
              items.length <= 2 && 'sm:justify-center',
              items.length <= 3 && 'lg:justify-center'
            )}
            wrapperClassName="rounded-3xl"
          >
            {items.map((item, index) => (
              <CarouselItem
                key={getKey(item)}
                className="basis-[82%] pl-0 sm:basis-[45%] lg:basis-1/3"
                aria-label={`${index + 1} of ${totalItems}`}
              >
                <div
                  data-current={selected === index}
                  className={cn(
                    'mx-2 h-full min-w-0 motion-safe:transition-[transform,opacity] motion-safe:duration-300',
                    canRotate &&
                      selected !== index &&
                      'scale-95 opacity-80 hover:opacity-100'
                  )}
                >
                  {renderItem(item, !canRotate || selected === index)}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      {(canRotate || hasMore) && (
        <div className="flex items-center justify-between gap-3">
          {!autoplay.reducedMotion && canRotate ? (
            <Button
              type="button"
              variant="ghost"
              size="touch"
              onClick={() => autoplay.setPaused(value => !value)}
              aria-label={
                autoplay.paused
                  ? 'Start automatic rotation'
                  : 'Pause automatic rotation'
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
            <span className="text-sm text-muted-foreground">{label}</span>
          )}
          <p
            aria-live={autoplay.rotating ? 'off' : 'polite'}
            aria-atomic="true"
            className="whitespace-nowrap text-sm tabular-nums text-muted-foreground"
          >
            <span className="font-semibold text-foreground">
              {Math.min(selected + 1, items.length)}
            </span>{' '}
            / {totalItems}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="touch"
              className="size-11 p-0"
              aria-label={previousLabel}
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
              aria-label={nextLabel}
              disabled={!api || (isLoadingMore && !api.canScrollNext())}
              onClick={() => scroll('next')}
            >
              {isLoadingMore && !api?.canScrollNext() ? (
                <Loader2 aria-hidden="true" className="size-5 animate-spin" />
              ) : (
                <ChevronRight aria-hidden="true" className="size-5" />
              )}
            </Button>
          </div>
        </div>
      )}
      {onLoadMore && (
        <div className="mt-3 min-h-6 text-center text-sm text-muted-foreground">
          {hasMore && !isLoadingMore && !isLoadMoreError && (
            <p>Use the arrows or swipe to explore all {totalItems} items.</p>
          )}
          {isLoadingMore && <p role="status">Loading more…</p>}
          {isLoadMoreError && (
            <p role="status">
              More items couldn’t be loaded.{' '}
              <Button
                type="button"
                variant="link"
                disabled={isLoadingMore}
                onClick={onLoadMore}
              >
                Try again
              </Button>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentCarousel;
