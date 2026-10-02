import { Skeleton } from '@components/ui/skeleton';

export const ProductDetailsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start py-4">
      <div className="space-y-3.5 w-full">
        <Skeleton className="w-full aspect-4/3 rounded-[20px]" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-4/3 rounded-[14px]" />
          ))}
        </div>
      </div>

      <div className="space-y-5 w-full">
        <Skeleton className="h-6 w-32 rounded-[7px]" />
        <Skeleton className="h-10 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-48 rounded-md" />
        <Skeleton className="h-10 w-44 rounded-[10px]" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 w-28 rounded-[16px]" />
          <Skeleton className="h-12 w-44 rounded-[16px]" />
          <Skeleton className="size-12 rounded-[16px]" />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
