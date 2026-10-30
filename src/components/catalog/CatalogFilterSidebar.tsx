import { RotateCcw } from 'lucide-react';
import { Slider } from '@components/ui/slider';
import { Checkbox } from '@components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@components/ui/skeleton';
import type { Category } from '@/types/category';

type Props = {
  categories?: Category[];
  isLoadingCategories?: boolean;
  isCategoriesError?: boolean;
  onRetryCategories?: () => void;
  selectedCategoryId?: number;
  onSelectCategory: (id?: number) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onSaleOnly: boolean;
  onToggleOnSaleOnly: () => void;
  onResetAll?: () => void;
};

const CatalogFilterSidebar = ({
  categories = [],
  isLoadingCategories = false,
  isCategoriesError = false,
  onRetryCategories,
  selectedCategoryId,
  onSelectCategory,
  priceRange,
  onPriceRangeChange,
  onSaleOnly,
  onToggleOnSaleOnly,
  onResetAll,
}: Props) => {
  const isPriceRangeInvalid = priceRange[0] > priceRange[1];
  const activeFiltersCount =
    (selectedCategoryId !== undefined ? 1 : 0) +
    (onSaleOnly ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 9000 ? 1 : 0);

  return (
    <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24">
      <ScrollArea className="w-full rounded-xl border border-border bg-[#fcfdfb] shadow-xs max-h-[calc(100dvh-7rem)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-[#fcfdfb] sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="font-heading font-semibold text-text-h text-base">
              Filters
            </span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetAll}
              className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer transition-colors font-medium"
            >
              <RotateCcw className="size-3" />
              <span>Reset all</span>
            </button>
          )}
        </div>
        <div className="p-5 border-b border-border space-y-3.5">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-text">
            Price range, ₴
          </div>
          <div className="flex items-center gap-2.5">
            <input
              type="number"
              autoComplete="off"
              placeholder="0"
              value={priceRange[0]}
              min={0}
              aria-invalid={isPriceRangeInvalid}
              onChange={e => {
                const val = Math.max(0, Number(e.target.value) || 0);
                onPriceRangeChange([val, priceRange[1]]);
              }}
              className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-sm text-text-h [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
            <span className="text-text-muted">—</span>
            <input
              type="number"
              autoComplete="off"
              placeholder="9000"
              value={priceRange[1]}
              max={99999}
              aria-invalid={isPriceRangeInvalid}
              onChange={e => {
                const val = Math.max(0, Number(e.target.value) || 0);
                onPriceRangeChange([priceRange[0], val]);
              }}
              className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-sm text-text-h [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>
          <Slider
            value={[
              Math.min(priceRange[0], priceRange[1]),
              Math.max(priceRange[0], priceRange[1]),
            ]}
            onValueChange={vals => {
              if (vals.length === 2) {
                onPriceRangeChange([vals[0], vals[1]]);
              }
            }}
            min={0}
            max={9000}
            step={50}
            className="mx-auto w-full cursor-pointer"
          />
          <div className="flex items-center justify-between text-xs text-text">
            <span>{priceRange[0]} ₴</span>
            <span>{priceRange[1]} ₴</span>
          </div>
          {isPriceRangeInvalid && (
            <p role="alert" className="text-xs text-red-600">
              The minimum can't be higher than the maximum. The price filter is
              paused until this is fixed
            </p>
          )}
        </div>

        <div className="p-5 border-b border-border space-y-3">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-text">
            Category
          </div>
          <div className="flex flex-col gap-1.5">
            {isLoadingCategories ? (
              <div className="space-y-2 py-1">
                <Skeleton className="h-7 w-full rounded-md" />
                <Skeleton className="h-7 w-4/5 rounded-md" />
                <Skeleton className="h-7 w-full rounded-md" />
                <Skeleton className="h-7 w-3/4 rounded-md" />
              </div>
            ) : isCategoriesError ? (
              <div className="py-2.5 px-3 rounded-lg bg-red-50 border border-red-200/60 text-xs text-red-700 space-y-1.5">
                <p className="font-medium">Failed to load categories</p>
                {onRetryCategories && (
                  <button
                    type="button"
                    onClick={onRetryCategories}
                    className="text-primary hover:underline font-semibold cursor-pointer block"
                  >
                    Try again
                  </button>
                )}
              </div>
            ) : Array.isArray(categories) && categories.length > 0 ? (
              categories.map(category => {
                const catId = Number(category.categoryId);
                const isChecked = selectedCategoryId === catId;
                return (
                  <label
                    key={catId}
                    className={`flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-muted/60 cursor-pointer text-sm transition-colors group ${
                      isChecked ? 'bg-muted/70 font-medium' : ''
                    }`}
                  >
                    <Checkbox
                      id={`cat-${catId}`}
                      checked={isChecked}
                      onCheckedChange={() =>
                        onSelectCategory(isChecked ? undefined : catId)
                      }
                    />
                    <span className="flex-1 text-text group-hover:text-text-h select-none capitalize">
                      {category.name}
                    </span>
                  </label>
                );
              })
            ) : (
              <div className="text-xs text-text-muted py-2 px-2 text-center rounded-md bg-muted/30">
                No categories available
              </div>
            )}
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-text">
            Offers
          </div>
          <label className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-muted/60 cursor-pointer text-sm transition-colors group">
            <Checkbox
              id="offer-sale"
              checked={onSaleOnly}
              onCheckedChange={onToggleOnSaleOnly}
            />
            <span className="flex-1 text-text group-hover:text-text-h select-none">
              On sale only
            </span>
            <span className="text-[11px] font-semibold text-white bg-[#FA1105] rounded px-1.5 py-0.5 leading-none">
              %
            </span>
          </label>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default CatalogFilterSidebar;
