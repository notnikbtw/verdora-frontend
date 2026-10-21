import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@components/ui/button';

type ReviewsCarouselProps = {
  children: ReactNode;
};

export const ReviewsCarousel = ({ children }: ReviewsCarouselProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 1);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateButtons();
    window.addEventListener('resize', updateButtons);
    return () => window.removeEventListener('resize', updateButtons);
  }, [updateButtons, children]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el || !el.firstElementChild) return;

    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = el.firstElementChild.getBoundingClientRect().width + gap;
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={scrollerRef}
        onScroll={updateButtons}
        tabIndex={0}
        role="region"
        aria-label="Customer reviews"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 no-scrollbar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-2xl"
      >
        {children}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => scrollByCard(-1)}
          disabled={!canScrollPrev}
          aria-label="Previous reviews"
          className="cursor-pointer rounded-full"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => scrollByCard(1)}
          disabled={!canScrollNext}
          aria-label="Next reviews"
          className="cursor-pointer rounded-full"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default ReviewsCarousel;
