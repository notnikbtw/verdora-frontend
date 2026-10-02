import { Skeleton } from '@components/ui/skeleton';

const CartItemSkeleton = () => {
  return (
    <div className="flex items-center justify-between gap-6 p-4 border rounded-2xl w-full bg-white min-h-28">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton className="w-20 h-20 rounded-xl" />

        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-8 w-23.75 rounded-full" />
      <Skeleton className="h-6 w-16" />
    </div>
  );
};

export default CartItemSkeleton;
