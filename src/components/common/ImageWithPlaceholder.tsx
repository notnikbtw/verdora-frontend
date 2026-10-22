import { useState } from 'react';
import { Flower2 } from 'lucide-react';
import { Skeleton } from '@components/ui/skeleton';
import { cn } from '@/lib/utils';

type ImageWithPlaceholderProps = {
  src?: string | null;
  alt: string;
  placeholderLabel?: string;
  loading?: 'lazy' | 'eager';
  className?: string;
  imageClassName?: string;
  iconClassName?: string;
};

export const ImageWithPlaceholder = ({
  src,
  alt,
  placeholderLabel,
  loading = 'lazy',
  className,
  imageClassName,
  iconClassName,
}: ImageWithPlaceholderProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  const showImage = Boolean(src) && src !== failedSrc;
  const isLoaded = showImage && loadedSrc === src;

  return (
    <div className={cn('relative size-full overflow-hidden', className)}>
      {showImage ? (
        <>
          {!isLoaded && (
            <Skeleton className="absolute inset-0 size-full rounded-none" />
          )}
          <img
            src={src!}
            alt={alt}
            loading={loading}
            onLoad={() => setLoadedSrc(src!)}
            onError={() => setFailedSrc(src!)}
            className={cn(
              'size-full object-cover transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              imageClassName
            )}
          />
        </>
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="flex size-full flex-col items-center justify-center gap-1.5 bg-[#F2F3F0] p-4 text-center text-text-muted"
        >
          <Flower2
            className={cn(
              'size-10 stroke-[1.2] text-primary/40',
              iconClassName
            )}
          />
          {placeholderLabel && (
            <span className="text-xs font-medium text-text-muted">
              {placeholderLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageWithPlaceholder;
