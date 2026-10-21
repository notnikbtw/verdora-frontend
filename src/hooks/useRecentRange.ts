import { useEffect, useState } from 'react';
import { getRecentRange } from '@/utils/report.utils';

const msUntilNextMidnight = () => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 1, 0);
  return next.getTime() - now.getTime();
};

/**
 * Inclusive "last N days" range that rolls over at local midnight, so a page
 * left open overnight does not keep using yesterday's window.
 */
export const useRecentRange = (days?: number) => {
  const [range, setRange] = useState(() => getRecentRange(days));

  useEffect(() => {
    const timer = setTimeout(
      () => setRange(getRecentRange(days)),
      msUntilNextMidnight()
    );
    return () => clearTimeout(timer);
  }, [range, days]);

  return range;
};
