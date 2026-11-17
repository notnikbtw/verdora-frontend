import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  label: string;
  placeholderClassName: string;
  children: ReactNode;
};

const DeferredSection = ({ label, placeholderClassName, children }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );

  useEffect(() => {
    if (ready || !ref.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ready]);

  const placeholder = (
    <div className={placeholderClassName}>
      <div aria-hidden="true" className="h-7 w-44 rounded-lg bg-muted/60" />
      <div
        aria-hidden="true"
        className="mt-6 h-64 w-full rounded-2xl bg-muted/40 sm:h-80"
      />
      <span className="sr-only">Loading {label}…</span>
    </div>
  );

  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      tabIndex={ready ? -1 : 0}
      onFocusCapture={() => setReady(true)}
      className="w-full empty:hidden focus-visible:outline-2 focus-visible:outline-primary"
      data-deferred-section={label}
    >
      {ready ? (
        <Suspense fallback={placeholder}>{children}</Suspense>
      ) : (
        placeholder
      )}
    </div>
  );
};

export default DeferredSection;
