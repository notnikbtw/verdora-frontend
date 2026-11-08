import { Link } from 'react-router-dom';
import { Skeleton } from '@components/ui/skeleton';
import type { Category } from '@/types/category';
import SectionLayout from '@components/common/section/SectionLayout';
import ImageWithPlaceholder from '@components/common/ImageWithPlaceholder';

type CategoryGridSectionProps = {
  title?: string;
  viewAllLink?: string;
  viewAllText?: string;
  categories?: Category[];
  isLoading?: boolean;
  limit?: number;
};

const CategoryGridSection = ({
  title = 'Categories',
  viewAllLink,
  viewAllText,
  categories,
  isLoading,
  limit = 6,
}: CategoryGridSectionProps) => {
  const displayCategories = Array.isArray(categories)
    ? categories.slice(0, limit)
    : [];

  return (
    <SectionLayout
      title={title}
      viewAllLink={viewAllLink}
      viewAllText={viewAllText}
      contentClassName="grid min-w-0 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4"
    >
      {isLoading
        ? Array.from({ length: limit }).map((_, idx) => (
            <Skeleton key={idx} className="min-w-0 w-full h-48 rounded-2xl" />
          ))
        : displayCategories.map(category => (
            <Link
              to={`/catalog?categoryId=${category.categoryId}`}
              key={category.categoryId}
              className="group card-surface card-interactive flex min-w-0 flex-col items-center gap-3 p-3 sm:p-4 h-48 text-center cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <p
                title={category.name}
                className="w-full min-w-0 shrink-0 truncate text-sm sm:text-base font-semibold leading-5 text-link-text group-hover:text-[#1E331B] transition-colors"
              >
                {category.name}
              </p>
              <ImageWithPlaceholder
                src={category.imageUrl}
                alt={category.name}
                className="h-auto min-h-0 flex-1 rounded-xl"
                zoomOnHover
              />
            </Link>
          ))}
    </SectionLayout>
  );
};

export default CategoryGridSection;
