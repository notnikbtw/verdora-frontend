import {
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

const subscribeFocus = (onChange: () => void) => {
  document.addEventListener('focusin', onChange);
  document.addEventListener('focusout', onChange);
  return () => {
    document.removeEventListener('focusin', onChange);
    document.removeEventListener('focusout', onChange);
  };
};

const isEditing = () => {
  const active = document.activeElement;
  return (
    active instanceof HTMLElement &&
    (active.matches(
      'input:not([type="checkbox"]):not([type="radio"]), textarea, select'
    ) ||
      active.isContentEditable)
  );
};

const MobileActionBar = ({ children }: { children: ReactNode }) => {
  const editing = useSyncExternalStore(subscribeFocus, isEditing, () => false);
  const barRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const root = document.documentElement;
    const property = '--mobile-action-bar-height';
    const previous = root.style.getPropertyValue(property);
    const updateHeight = () => {
      root.style.setProperty(
        property,
        `${bar.getBoundingClientRect().height}px`
      );
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(bar);

    return () => {
      observer.disconnect();
      if (previous) root.style.setProperty(property, previous);
      else root.style.removeProperty(property);
    };
  }, [editing]);

  if (editing || typeof document === 'undefined') return null;

  return createPortal(
    <section
      ref={barRef}
      aria-label="Quick actions"
      data-mobile-action-bar
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background shadow-[0_-4px_20px_rgb(0_0_0/0.08)] px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:hidden"
    >
      <div className="mx-auto max-w-lg space-y-2">{children}</div>
    </section>,
    document.body
  );
};

export default MobileActionBar;
