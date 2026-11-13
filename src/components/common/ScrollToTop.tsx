import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { scrollToTop } from '@/utils/scroll.utils';

export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    const pathChanged = previousPathname.current !== pathname;
    previousPathname.current = pathname;
    if (!pathChanged) return;
    if (
      navigationType === 'POP' &&
      (pathname === '/catalog' || pathname === '/sales')
    )
      return;
    scrollToTop();
  }, [pathname, navigationType]);

  return null;
};

export default ScrollToTop;
