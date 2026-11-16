import { useCallback, useMemo } from 'react';
import { usePaginatedCategories } from '@api/category/category.hooks';
import CategoryCarouselSection from '@components/common/section/CategoryCarouselSection';

const HomeCategoriesSection = () => {
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = usePaginatedCategories();
  const categories = useMemo(
    () => [
      ...new Map(
        (data?.pages.flatMap(page => page.content) ?? []).map(category => [
          category.categoryId,
          category,
        ])
      ).values(),
    ],
    [data]
  );
  const loadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  return (
    <CategoryCarouselSection
      categories={categories}
      totalCategories={data?.pages[0]?.totalElements}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => {
        void refetch();
      }}
      hasMore={Boolean(hasNextPage)}
      isLoadingMore={isFetchingNextPage}
      isLoadMoreError={isFetchNextPageError}
      onLoadMore={loadMore}
    />
  );
};

export default HomeCategoriesSection;
