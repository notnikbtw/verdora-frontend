import React from 'react';
import { Card, CardContent } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import {
  Search,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { Category } from '@/types/category';

type ProductFilterBarProps = {
  search: string;
  categoryId: 'ALL' | number;
  sortBy: string;
  categoriesData?: Category[];
  isCategoriesLoading: boolean;
  isCategoriesError: boolean;
  sortOptions: { value: string; label: string }[];
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onClearSearch: () => void;
  onClearCategory: () => void;
  onClearSort: () => void;
  onClearAllFilters: () => void;
};

export const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
  search,
  categoryId,
  sortBy,
  categoriesData,
  isCategoriesLoading,
  isCategoriesError,
  sortOptions,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onClearSearch,
  onClearCategory,
  onClearSort,
  onClearAllFilters,
}) => {
  const hasActiveFilters = Boolean(
    search.trim() ||
    (categoryId && categoryId !== 'ALL') ||
    sortBy !== 'createdAt,desc'
  );

  return (
    <Card className="mt-6 border-border shadow-sm">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={onSearchChange}
              className="pl-9 pr-9 h-10 w-full"
              aria-label="Search products by name"
            />
            {search && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-4 relative">
            <div className="relative flex items-center">
              <Filter className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
              {isCategoriesError && (
                <p>Failed to load categories. Please try again.</p>
              )}
              <select
                value={categoryId}
                onChange={onCategoryChange}
                className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer text-foreground"
                aria-label="Filter by category"
                disabled={isCategoriesLoading}
              >
                <option value="ALL">All Categories (Catalog)</option>
                {categoriesData?.map(c => {
                  return (
                    <option key={c.categoryId} value={c.name}>
                      {c.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="md:col-span-3 relative">
            <div className="relative flex items-center">
              <ArrowUpDown className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
              <select
                value={sortBy}
                onChange={onSortChange}
                className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer text-foreground"
                aria-label="Sort products"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <SlidersHorizontal className="size-3" /> Active Filters:
            </span>

            {search.trim() && (
              <Badge
                variant="secondary"
                className="gap-1 px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
              >
                Search: "{search}"
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="ml-1 text-primary hover:text-foreground cursor-pointer rounded-full p-0.5"
                  aria-label="Remove search filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {categoryId && categoryId !== 'ALL' && (
              <Badge
                variant="secondary"
                className="gap-1 px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
              >
                Category: {categoryId}
                <button
                  type="button"
                  onClick={onClearCategory}
                  className="ml-1 text-primary hover:text-foreground cursor-pointer rounded-full p-0.5"
                  aria-label="Remove category filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {sortBy !== 'createdAt,desc' && (
              <Badge
                variant="secondary"
                className="gap-1 px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
              >
                Sort:{' '}
                {sortOptions.find(s => s.value === sortBy)?.label || sortBy}
                <button
                  type="button"
                  onClick={onClearSort}
                  className="ml-1 text-primary hover:text-foreground cursor-pointer rounded-full p-0.5"
                  aria-label="Reset sorting"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAllFilters}
              className="h-7 text-xs text-muted-foreground hover:text-destructive cursor-pointer px-2 ml-auto"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductFilterBar;
