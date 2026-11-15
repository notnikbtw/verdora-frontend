import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@components/ui/breadcrumb';
import { cn } from '@/lib/utils';

export type BreadcrumbItemConfig = {
  label: React.ReactNode;
  href?: string;
};

export type BreadcrumbsProps = {
  items?: BreadcrumbItemConfig[];
  root?: {
    label: string;
    href: string;
  };
  className?: string;
};

const SEGMENT_HREF_OVERRIDES: Record<string, string> = {
  products: '/catalog',
};

const formatSegment = (segment: string): string => {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const Breadcrumbs = ({ items, root, className }: BreadcrumbsProps) => {
  const location = useLocation();

  const resolvedItems: BreadcrumbItemConfig[] = React.useMemo(() => {
    if (items && items.length > 0) {
      return items;
    }

    const defaultRoot = root ?? { label: 'Home', href: '/' };
    const rawSegments = location.pathname.split('/').filter(Boolean);

    const rootSegment = defaultRoot.href.split('/').filter(Boolean)[0];
    const hasMatchingRootSegment = Boolean(
      rootSegment && rawSegments[0]?.toLowerCase() === rootSegment.toLowerCase()
    );

    const subSegments = hasMatchingRootSegment
      ? rawSegments.slice(1)
      : rawSegments;

    const generated: BreadcrumbItemConfig[] = [];

    generated.push({
      label: defaultRoot.label,
      href: subSegments.length > 0 ? defaultRoot.href : undefined,
    });

    subSegments.forEach((segment, index) => {
      const isLast = index === subSegments.length - 1;
      const pathPrefix =
        hasMatchingRootSegment && defaultRoot.href !== '/'
          ? defaultRoot.href
          : '';
      const rawHref = `${pathPrefix}/${subSegments.slice(0, index + 1).join('/')}`;
      const href = SEGMENT_HREF_OVERRIDES[segment.toLowerCase()] ?? rawHref;

      generated.push({
        label: formatSegment(segment),
        href: isLast ? undefined : href,
      });
    });

    return generated;
  }, [items, root, location.pathname]);

  if (resolvedItems.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className={cn(className, 'mt-3 min-w-0 max-w-full')}>
      <BreadcrumbList>
        {resolvedItems.map((item, index) => {
          const isLast = index === resolvedItems.length - 1;
          const isLink = Boolean(item.href) && !isLast;

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem className="min-w-0 max-w-full">
                {isLink ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.href!}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage
                    className="min-w-0 truncate"
                    title={
                      typeof item.label === 'string' ? item.label : undefined
                    }
                  >
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
