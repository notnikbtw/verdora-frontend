import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  viewMode: 'grid' | 'list';
  count?: number;
  // Overrides the default wrapper layout, e.g. to match a different grid.
  className?: string;
};

const CatalogProductCardSkeleton = ({
  viewMode,
  count = 6,
  className,
}: Props) => {
  const isGrid = viewMode === 'grid';

  return (
    <div
      className={
        className ??
        (isGrid
          ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
          : 'flex flex-col gap-4')
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className={`border border-border bg-[#fcfdfb] rounded-[22px] overflow-hidden p-4 shadow-xs ${
            isGrid
              ? 'flex flex-col gap-3.5'
              : 'flex flex-col sm:flex-row items-center gap-5'
          }`}
        >
          <div
            className={`flex items-start justify-between gap-3 w-full ${
              !isGrid ? 'order-2 flex-1' : ''
            }`}
          >
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-3/4" />
              {!isGrid && <Skeleton className="h-4 w-full mt-2" />}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="size-9 rounded-full" />
            </div>
          </div>
          <div
            className={`relative w-full rounded-[14px] overflow-hidden ${
              isGrid ? 'h-52 sm:h-56' : 'h-48 sm:w-64 sm:h-44 order-1 shrink-0'
            }`}
          >
            <Skeleton className="w-full h-full rounded-none" />
            <Skeleton className="absolute left-3.5 bottom-3.5 h-6 w-16 rounded-[7px]" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CatalogProductCardSkeleton;
