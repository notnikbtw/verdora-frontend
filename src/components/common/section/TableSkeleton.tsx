import { Skeleton } from '@components/ui/skeleton';

const TableSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
);

export default TableSkeleton;
