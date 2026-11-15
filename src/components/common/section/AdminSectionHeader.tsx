type Props = {
  title: React.ReactNode;
  count?: number;
  countLabel?: string;
  badge?: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
};

const AdminSectionHeader = ({
  title,
  count,
  countLabel = 'total',
  badge,
  description,
  children,
}: Props) => {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl flex items-center gap-3">
          <span className="font-heading font-semibold text-text-h">
            {title}
          </span>
          {typeof count === 'number' && count > 0 && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {count} {countLabel}
            </span>
          )}
          {badge}
        </h1>
        {description && (
          <p className="text-pretty text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </header>
  );
};

export { AdminSectionHeader, AdminSectionHeader as SectionHeader };
export default AdminSectionHeader;
