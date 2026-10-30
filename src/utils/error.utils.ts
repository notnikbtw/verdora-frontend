import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

export const NO_INTERNET_MESSAGE =
  'No internet connection. Please check your network connection and try again.';

export const isOffline = (): boolean =>
  typeof navigator !== 'undefined' && !navigator.onLine;

export const assertOnline = (): void => {
  if (isOffline()) throw new Error(NO_INTERNET_MESSAGE);
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  if (isOffline()) return NO_INTERNET_MESSAGE;
  const message = (error as AxiosError<ApiErrorResponse> | undefined)?.response
    ?.data?.message;
  return message || fallback;
};
