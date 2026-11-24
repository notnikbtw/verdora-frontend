import {
  useEffect,
  useState,
  useSyncExternalStore,
  type RefObject,
} from 'react';
import type { CarouselApi } from '@components/ui/carousel';

const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
};

export const useCarouselAutoplay = (
  api: CarouselApi,
  rootRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  delay: number
) => {
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => true
  );
  const documentVisible = useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === 'visible',
    () => false
  );

  useEffect(() => {
    if (!rootRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.25),
      { threshold: 0.25 }
    );
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [rootRef]);

  useEffect(() => {
    if (!api) return;
    const stopAfterDrag = () => setPaused(true);
    api.on('pointerDown', stopAfterDrag);
    return () => {
      api.off('pointerDown', stopAfterDrag);
    };
  }, [api]);

  const rotating =
    enabled &&
    !paused &&
    !hovered &&
    !focused &&
    inView &&
    documentVisible &&
    !reducedMotion;
  useEffect(() => {
    if (!api || !rotating) return;
    const timer = window.setInterval(() => {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, delay);
    return () => window.clearInterval(timer);
  }, [api, rotating, delay]);

  return { paused, setPaused, setHovered, setFocused, reducedMotion, rotating };
};
