import React from 'react';
import { Card, CardContent } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { ArrowUpDown, Percent, Search, X } from 'lucide-react';
import type { DiscountFilter } from '@/config/discount.config';

type DiscountFilterBarProps = {
  search: string;
  filter: DiscountFilter;
  sortBy: string;
  filterOptions: { value: DiscountFilter; label: string }[];
  sortOptions: { value: string; label: string }[];
  onSearchChange: (value: string) => void;
  onFilterChange: (value: DiscountFilter) => void;
  onSortChange: (value: string) => void;
};

const selectClass =
  'w-full h-10 rounded-md border border-input bg-background pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer text-foreground';

export const DiscountFilterBar: React.FC<DiscountFilterBarProps> = ({
  search,
  filter,
  sortBy,
  filterOptions,
  sortOptions,
  onSearchChange,
  onFilterChange,
  onSortChange,
}) => {
  return (
    <Card className="mt-6 border-border shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-9 pr-9 h-10 w-full"
              aria-label="Search products by name"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-3 relative flex items-center">
            <Percent className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
            <select
              value={filter}
              onChange={e => onFilterChange(e.target.value as DiscountFilter)}
              className={selectClass}
              aria-label="Filter by discount"
            >
              {filterOptions.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 relative flex items-center">
            <ArrowUpDown className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
            <select
              value={sortBy}
              onChange={e => onSortChange(e.target.value)}
              className={selectClass}
              aria-label="Sort products"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscountFilterBar;
