export type DiscountFilter = 'ALL' | 'DISCOUNTED';

export const DISCOUNT_FILTER_OPTIONS: {
  value: DiscountFilter;
  label: string;
}[] = [
  { value: 'ALL', label: 'All products' },
  { value: 'DISCOUNTED', label: 'Discounted only' },
];

export const DISCOUNT_SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Date added: Newest first' },
  { value: 'createdAt,asc', label: 'Date added: Oldest first' },
  { value: 'price,asc', label: 'Price: Low to High' },
  { value: 'price,desc', label: 'Price: High to Low' },
  { value: 'name,asc', label: 'Alphabetical: A–Z' },
  { value: 'name,desc', label: 'Alphabetical: Z–A' },
];

export const DEFAULT_DISCOUNT_FILTER: DiscountFilter = 'DISCOUNTED';
export const DEFAULT_DISCOUNT_SORT = 'createdAt,desc';
export const DISCOUNT_PAGE_SIZE = 12;
export const DISCOUNT_SEARCH_DEBOUNCE_MS = 500;
