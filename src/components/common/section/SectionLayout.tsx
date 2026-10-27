import { Link } from 'react-router-dom';
import type React from 'react';

type SectionLayoutProps = {
  title: string;
  titleIcon?: React.ReactNode;
  viewAllLink?: string;
  viewAllText?: string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

export const SectionLayout = ({
  title,
  titleIcon,
  viewAllLink,
  viewAllText = 'View all',
  className = 'flex flex-col gap-6 w-full',
  headerClassName = 'flex items-center justify-between gap-4',
  contentClassName,
  children,
}: SectionLayoutProps) => {
  return (
    <section className={className}>
      <div className={headerClassName}>
        <div className="flex items-center gap-3">
          {titleIcon}
          <h2 className="text-lg lg:text-2xl sm:text-4xl font-semibold text-link-text">
            {title}
          </h2>
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-lg lg:text-2xl sm:text-4xl font-semibold text-link-text"
          >
            {viewAllText}
          </Link>
        )}
      </div>
      <div className={contentClassName}>{children}</div>
    </section>
  );
};

export default SectionLayout;
