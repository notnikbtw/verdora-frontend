import type { ReportGroupBy } from '@/types/report';

export const GROUP_BY_OPTIONS: { value: ReportGroupBy; label: string }[] = [
  { value: 'HOUR', label: 'Hour' },
  { value: 'DAY', label: 'Day' },
  { value: 'WEEK', label: 'Week' },
  { value: 'MONTH', label: 'Month' },
];

export const DEFAULT_GROUP_BY: ReportGroupBy = 'DAY';
export const DEFAULT_PENDING_DAYS = 7;
export const PENDING_DAYS_MAX_LENGTH = 4;
export const REVENUE_RANGE_DAYS = 30;
export const REPORT_TABLE_CONTAINER_CLASS = 'max-h-80 overflow-y-auto';
export const DATE_INPUT_DEBOUNCE_MS = 400;
// Longest allowed revenue range (in days) per grouping, to keep the chart and
// table to a few hundred points at most.
export const MAX_RANGE_DAYS: Record<ReportGroupBy, number> = {
  HOUR: 7,
  DAY: 366,
  WEEK: 366 * 3,
  MONTH: 366 * 10,
};
