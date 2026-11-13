import { Skeleton } from '@components/ui/skeleton';

export const ProfileSkeleton = () => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-5 md:gap-8 items-start">
      <div className="w-full md:w-60 lg:w-64 shrink-0 grid grid-cols-4 md:flex md:flex-col gap-2">
        <Skeleton className="h-16 md:h-12 w-full rounded-xl" />
        <Skeleton className="h-16 md:h-12 w-full rounded-xl" />
        <Skeleton className="h-16 md:h-12 w-full rounded-xl" />
        <Skeleton className="h-16 md:h-12 w-full rounded-xl" />
      </div>

      <div className="flex-1 min-w-0 w-full flex flex-col gap-6">
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-6 shadow-xs flex flex-col gap-4">
          <Skeleton className="h-16 sm:h-24 w-full rounded-xl" />
          <div className="flex min-w-0 items-center gap-3 -mt-8 px-2">
            <Skeleton className="size-16 sm:size-24 shrink-0 rounded-full border-4 border-white" />
            <div className="min-w-0 flex-1 space-y-2 mt-8">
              <Skeleton className="h-7 w-full max-w-48 rounded-lg" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-4">
          <Skeleton className="h-6 w-44 rounded-md mb-2" />
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <span className="text-sm text-muted-foreground mt-2">
            Loading your profile…
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
