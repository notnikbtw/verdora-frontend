import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const STORAGE_KEY = 'verdora:catalog-scroll';

const readPositions = (): Record<string, number> => {
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) || '{}'
    );
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter(
        ([, y]) => typeof y === 'number' && Number.isFinite(y) && y >= 0
      )
    );
  } catch {
    return {};
  }
};

export const useCatalogScrollRestoration = (isReady: boolean) => {
  const location = useLocation();
  const key = JSON.stringify([
    location.key,
    location.pathname,
    location.search,
  ]);
  const navigationType = useNavigationType();
  const pending = useRef<{ key: string; y: number; restored: boolean } | null>(
    null
  );

  useLayoutEffect(() => {
    if (pending.current?.key !== key) {
      const y = navigationType === 'POP' ? readPositions()[key] : undefined;
      pending.current = { key, y: y ?? 0, restored: y === undefined };
    }
    if (!isReady || pending.current.restored) return;
    const position = pending.current;
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: position.y, left: 0, behavior: 'instant' });
      position.restored = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [key, navigationType, isReady]);

  useEffect(() => {
    let lastY = readPositions()[key] ?? window.scrollY;
    const track = () => {
      if (pending.current?.restored) lastY = window.scrollY;
    };
    const save = () => {
      const positions = readPositions();
      delete positions[key];
      const entries = [
        ...Object.entries(positions),
        [key, lastY] as const,
      ].slice(-50);
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(Object.fromEntries(entries))
        );
      } catch {
        // Browsing remains available when session storage is blocked.
      }
    };
    window.addEventListener('scroll', track, { passive: true });
    window.addEventListener('pagehide', save);
    return () => {
      save();
      window.removeEventListener('scroll', track);
      window.removeEventListener('pagehide', save);
    };
  }, [key]);
};
