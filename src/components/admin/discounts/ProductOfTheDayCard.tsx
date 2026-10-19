import { useState } from 'react';
import { Package, Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import ErrorSection from '@components/common/section/ErrorSection';
import { EmptySection } from '@components/common/section/EmptySection';
import { useGetProductOfTheDay } from '@api/product/product.hooks';
import { useAllCategories } from '@api/category/category.hooks';
import { formatCurrency } from '@/utils/order.utils';

const ProductOfTheDayCard = () => {
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProductOfTheDay();
  const { data: categories } = useAllCategories();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  const categoryName = product
    ? categories.find(c => Number(c.categoryId) === product.categoryId)?.name
    : undefined;
  const showImage = product?.imageUrl && product.imageUrl !== failedImageUrl;

  return (
    <Card className="mt-6 border-border shadow-sm">
      <CardHeader className="py-4 px-6 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden="true" />
          Product of the Day
        </CardTitle>
        <CardDescription className="text-xs mt-0.5">
          Chosen by the backend. Prices are shown exactly as the API returns
          them.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="size-20 rounded-md shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        ) : isError ? (
          <ErrorSection
            title="Failed to load the product of the day"
            message={error?.response?.data?.message}
            onRetry={() => refetch()}
          />
        ) : !product ? (
          <EmptySection
            title="No product of the day"
            description="The backend did not return a product of the day."
            icon={
              <div className="flex items-center justify-center rounded-full bg-muted p-4">
                <Package
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            }
          />
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="size-20 rounded-md border border-border bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
              {showImage ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="size-full object-cover"
                  onError={() => setFailedImageUrl(product.imageUrl)}
                />
              ) : (
                <Package
                  className="size-8 text-muted-foreground/60"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <p
                className="text-lg font-semibold truncate"
                title={product.name}
              >
                {product.name}
              </p>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                ID {product.productId}
                {categoryName ? ` · ${categoryName}` : ''}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-6 sm:text-right">
              <div>
                <dt className="text-xs text-muted-foreground">Price</dt>
                <dd className="text-lg font-semibold">
                  {formatCurrency(product.price)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  Discount price
                </dt>
                <dd className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(product.discountPrice)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductOfTheDayCard;
