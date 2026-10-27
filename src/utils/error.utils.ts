import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

// The backend's message when it has one, otherwise a generic fallback.
export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  const message = (error as AxiosError<ApiErrorResponse> | undefined)?.response
    ?.data?.message;
  return message || fallback;
};
