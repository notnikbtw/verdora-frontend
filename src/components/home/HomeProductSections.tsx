import { useGetProducts } from '@api/product/product.hooks';
import { useCategoriesByIds } from '@api/category/category.hooks';
import ProductGridSection from '@components/common/section/ProductGridSection';

const useHomeProducts = (discount?: boolean) => {
  const query = useGetProducts({
    size: 8,
    ...(discount ? { discount: true } : {}),
  });
  const categoryIds =
    query.data?.content.map(product => product.categoryId) ?? [];
  const categories = useCategoriesByIds(categoryIds);
  // Reserve the category label row while its name is loading.
  const categoryMap = new Map<number, string>(categoryIds.map(id => [id, ' ']));
  for (const category of categories) {
    if (category.data)
      categoryMap.set(category.data.categoryId, category.data.name);
  }
  return { ...query, categoryMap };
};

export const HomeSalesSection = () => {
  const { data, isLoading, categoryMap } = useHomeProducts(true);
  return (
    <ProductGridSection
      title="Sales"
      viewAllLink="/catalog?discount=true"
      products={data?.content}
      isLoading={isLoading}
      limit={8}
      categoryMap={categoryMap}
      emptyTitle="No sales products found"
      emptyDescription="There are no discounted products available at the moment."
    />
  );
};

export const HomeCatalogSection = () => {
  const { data, isLoading, categoryMap } = useHomeProducts();
  return (
    <ProductGridSection
      title="Find your perfect plant"
      viewAllLink="/catalog"
      products={data?.content}
      isLoading={isLoading}
      limit={8}
      categoryMap={categoryMap}
    />
  );
};
