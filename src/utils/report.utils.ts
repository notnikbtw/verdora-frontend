import { REVENUE_RANGE_DAYS } from '@/config/report.config';

const toDateInput = (date: Date) => date.toLocaleDateString('en-CA');

export const getRecentRange = (days = REVENUE_RANGE_DAYS) => {
  const to = new Date();
  const from = new Date();
  // Inclusive window: `days` calendar days ending today.
  from.setDate(to.getDate() - (days - 1));
  return { from: toDateInput(from), to: toDateInput(to) };
};

export const parsePositiveInteger = (value: string): number | undefined =>
  /^[1-9]\d*$/.test(value) ? Number(value) : undefined;

export const stripNonDigits = (value: string) => value.replace(/\D/g, '');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Inclusive number of calendar days between two yyyy-mm-dd strings. */
export const countDaysInclusive = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / MS_PER_DAY) + 1;
