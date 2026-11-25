import { Link } from 'react-router-dom';
import { ArrowRight, Sprout } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';
import ImageWithPlaceholder from '@components/common/ImageWithPlaceholder';
import ErrorSection from '@components/common/section/ErrorSection';
import ContentCarousel from '@components/common/ContentCarousel';
import { cn } from '@/lib/utils';
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
  return (
    <section
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
        <ContentCarousel
          items={categories}
          getKey={category => category.categoryId}
          totalItems={totalCategories}
          label="Categories"
          previousLabel="Previous category"
          nextLabel="Next category"
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          isLoadMoreError={isLoadMoreError}
          onLoadMore={onLoadMore}
          renderItem={(category, active) => (
            <Link
              to={`/catalog?category=${category.categoryId}`}
              title={category.name}
              aria-label={`Browse ${category.name}`}
              data-category-id={category.categoryId}
              className={cn(
                'group block h-full min-w-0 rounded-3xl border bg-card p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-safe:transition-shadow',
                active ? 'border-primary/50 shadow-lg' : 'border-border'
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
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-primary'
                  )}
                >
                  <ArrowRight aria-hidden="true" className="size-5" />
                </span>
              </div>
            </Link>
          )}
        />
      )}
    </section>
  );
};

export default CategoryCarouselSection;
