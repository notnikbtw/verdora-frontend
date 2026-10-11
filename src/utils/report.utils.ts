import { REVENUE_RANGE_DAYS } from '@/config/report.config';

const toDateInput = (date: Date) => date.toLocaleDateString('en-CA');

export const getRecentRange = (days = REVENUE_RANGE_DAYS) => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days);
  return { from: toDateInput(from), to: toDateInput(to) };
};

export const parsePositiveInteger = (value: string): number | undefined =>
  /^[1-9]\d*$/.test(value) ? Number(value) : undefined;

export const stripNonDigits = (value: string) => value.replace(/\D/g, '');
