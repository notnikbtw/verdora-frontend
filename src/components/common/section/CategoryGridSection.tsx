import { Link } from 'react-router-dom';
import { Skeleton } from '@components/ui/skeleton';
import type { Category } from '@/types/category';
import SectionLayout from '@components/common/section/SectionLayout';

const getPlaceholder = (name: string) =>
  `https://placehold.co/600x400?text=${encodeURIComponent(name)}`;

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
              className="group flex flex-col justify-between items-center gap-3 rounded-2xl bg-white/70 hover:bg-white backdrop-blur-sm border border-white/80 p-4 h-48 text-center shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
            >
              <p className="text-sm sm:text-base font-semibold leading-tight text-link-text group-hover:text-[#1E331B] transition-colors">
                {category.name}
              </p>
              <div className="h-28 w-full flex items-center justify-center overflow-hidden">
                <img
                  src={category.imageUrl || getPlaceholder(category.name)}
                  alt={category.name}
                  loading="lazy"
                  onError={e => {
                    const fallback = getPlaceholder(category.name);
                    if (e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                  className="max-h-full w-auto object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </Link>
          ))}
    </SectionLayout>
  );
};

export default CategoryGridSection;
