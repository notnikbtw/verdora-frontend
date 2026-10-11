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
