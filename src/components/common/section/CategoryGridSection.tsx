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
      contentClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2"
    >
      {isLoading
        ? Array.from({ length: limit }).map((_, idx) => (
            <Skeleton
              key={idx}
              className="w-full aspect-[1/0.98] rounded-3xl"
            />
          ))
        : displayCategories.map(category => (
            <Link
              to={`/catalog?categoryId=${category.categoryId}`}
              key={category.categoryId}
              className="group card-surface card-interactive flex flex-col justify-between items-center gap-3 p-4 h-48 text-center cursor-pointer"
            >
              <p className="text-sm sm:text-base font-semibold leading-tight text-link-text group-hover:text-[#1E331B] transition-colors truncate">
                {category.name}
              </p>
              <div className="h-28 w-full flex items-center justify-center overflow-hidden">
                <ImageWithPlaceholder
                  src={category.imageUrl}
                  alt={category.name}
                  className="rounded-xl"
                  imageClassName="object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </Link>
          ))}
    </SectionLayout>
  );
};

export default CategoryGridSection;
