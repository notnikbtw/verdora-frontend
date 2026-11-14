import { LayoutGrid, List } from 'lucide-react';
import { useId } from 'react';

export type ViewMode = 'grid' | 'list';

type Props = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedSort?: string;
  onSortChange?: (sortId: string) => void;
};

const SORT_OPTIONS = [
  { id: 'rating', label: 'Rating', selectLabel: 'Rating' },
  { id: 'price-asc', label: 'Price ↑', selectLabel: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price ↓', selectLabel: 'Price: High to Low' },
  { id: 'date', label: 'Newest', selectLabel: 'Newest first' },
  { id: 'az', label: 'A–Z', selectLabel: 'Name: A–Z' },
  { id: 'za', label: 'Z–A', selectLabel: 'Name: Z–A' },
];

const CatalogToolbar = ({
  viewMode,
  onViewModeChange,
  selectedSort = 'rating',
  onSortChange,
}: Props) => {
  const sortId = useId();
  return (
    <div className="bg-[#fcfdfb] border border-border rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-2 sm:gap-3 shadow-xs">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <label
          htmlFor={sortId}
          className="sr-only sm:not-sr-only sm:shrink-0 sm:text-sm sm:font-medium sm:text-text xl:hidden"
        >
          Sort by
        </label>
        <span className="hidden xl:inline text-sm font-medium text-text shrink-0">
          Sort by
        </span>
        <select
          id={sortId}
          value={selectedSort}
          onChange={event => onSortChange?.(event.target.value)}
          className="h-11 min-w-0 flex-1 truncate rounded-md border border-border bg-background px-2 text-base text-text focus-visible:outline-2 focus-visible:outline-primary xl:hidden"
        >
          {SORT_OPTIONS.map(sort => (
            <option key={sort.id} value={sort.id}>
              {sort.selectLabel}
            </option>
          ))}
        </select>
        <div
          role="group"
          aria-label="Sort products"
          className="hidden xl:flex items-center gap-1.5 flex-wrap"
        >
          {SORT_OPTIONS.map(sort => {
            const isActive = selectedSort === sort.id;
            return (
              <button
                key={sort.id}
                type="button"
                onClick={() => onSortChange?.(sort.id)}
                aria-pressed={isActive}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-background text-text border-border hover:bg-muted/70 hover:text-text-h'
                }`}
              >
                {sort.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        role="group"
        aria-label="Product display"
        className="flex items-center gap-1 bg-background border border-border rounded-lg p-1 shrink-0"
      >
        <button
          type="button"
          onClick={() => onViewModeChange('grid')}
          className={`flex size-11 items-center justify-center gap-1.5 xl:w-auto xl:px-3 rounded-md text-sm font-medium cursor-pointer transition-all ${
            viewMode === 'grid'
              ? 'bg-secondary text-secondary-foreground shadow-xs'
              : 'text-text hover:text-text-h'
          }`}
          aria-label="Grid view"
          title="Grid view"
          aria-pressed={viewMode === 'grid'}
        >
          <LayoutGrid className="size-4" />
          <span className="hidden xl:inline">Grid</span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('list')}
          className={`flex size-11 items-center justify-center gap-1.5 xl:w-auto xl:px-3 rounded-md text-sm font-medium cursor-pointer transition-all ${
            viewMode === 'list'
              ? 'bg-secondary text-secondary-foreground shadow-xs'
              : 'text-text hover:text-text-h'
          }`}
          aria-label="List view"
          title="List view"
          aria-pressed={viewMode === 'list'}
        >
          <List className="size-4" />
          <span className="hidden xl:inline">List</span>
        </button>
      </div>
    </div>
  );
};

export default CatalogToolbar;
