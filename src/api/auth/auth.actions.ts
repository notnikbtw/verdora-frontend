import { createAsyncThunk } from '@reduxjs/toolkit';
import type { UserType } from '@/types/user';
import { isAxiosError } from 'axios';
import type { ApiResponse, ApiErrorResponse } from '@/types/api';
import { authService } from '@/api/auth/auth.service';
import type {
  ForgotPasswordPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from '@/types/auth';

export const NO_INTERNET_MESSAGE =
  'No internet connection. Please check your network connection and try again.';

export const SERVER_UNAVAILABLE_MESSAGE =
  'Server is currently unavailable. Please try again in a few moments.';

export const isNetworkError = (error: unknown): boolean => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }
  if (isAxiosError(error)) {
    return (
      (error.code === 'ERR_NETWORK' || error.message === 'Network Error') &&
      typeof navigator !== 'undefined' &&
      !navigator.onLine
    );
  }
  return false;
};

export const handleAuthError = (
  error: unknown,
  defaultMessage: string
): ApiErrorResponse => {
  if (isNetworkError(error)) {
    return {
      timestamp: new Date().toISOString(),
      status: 0,
      message: NO_INTERNET_MESSAGE,
    };
  }

  if (isAxiosError(error)) {
    if (error.response?.data) {
      return error.response.data as ApiErrorResponse;
    }
    if (!error.response) {
      return {
        timestamp: new Date().toISOString(),
        status: 503,
        message: SERVER_UNAVAILABLE_MESSAGE,
      };
    }
    return {
      timestamp: new Date().toISOString(),
      status: error.response?.status || 500,
      message: error.message || defaultMessage,
    };
  }

  if (error instanceof Error) {
    return {
      timestamp: new Date().toISOString(),
      status: 500,
      message: error.message || defaultMessage,
    };
  }

  return {
    timestamp: new Date().toISOString(),
    status: 500,
    message: defaultMessage,
  };
};

export const register = createAsyncThunk<
  ApiResponse<UserType>,
  RegisterPayload,
  { rejectValue: ApiErrorResponse }
>('auth/register', async (userData, { rejectWithValue }) => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return rejectWithValue({
      timestamp: new Date().toISOString(),
      status: 0,
      message: NO_INTERNET_MESSAGE,
    });
  }
  try {
    const response = await authService.register(userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAuthError(error, 'Registration failed'));
  }
});

export const login = createAsyncThunk<
  ApiResponse<UserType>,
  { email: string; password: string },
  { rejectValue: ApiErrorResponse }
>(
  'auth/login',
  async (
    userData: { email: string; password: string },
    { rejectWithValue }
  ) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return rejectWithValue({
        timestamp: new Date().toISOString(),
        status: 0,
        message: NO_INTERNET_MESSAGE,
      });
    }
    try {
      const response = await authService.login(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAuthError(error, 'Login failed'));
    }
  }
);

export const logout = createAsyncThunk<
  void,
  void,
  { rejectValue: ApiErrorResponse }
>('auth/logout', async (_, { rejectWithValue }) => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return rejectWithValue({
      timestamp: new Date().toISOString(),
      status: 0,
      message:
        'Cannot log out while offline. Please reconnect to the internet to end your session.',
    });
  }
  try {
    await authService.logout();
  } catch (error) {
    return rejectWithValue(handleAuthError(error, 'Logout failed'));
  }
});

export const fetchMe = createAsyncThunk<
  ApiResponse<UserType>,
  void,
  { rejectValue: ApiErrorResponse }
>('auth/me', async (_, { rejectWithValue }) => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return rejectWithValue({
      timestamp: new Date().toISOString(),
      status: 0,
      message: NO_INTERNET_MESSAGE,
    });
  }
  try {
    const response = await authService.fetchMe();
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAuthError(error, 'Session restore failed'));
  }
});

export const forgotPassword = createAsyncThunk<
  void,
  ForgotPasswordPayload,
  { rejectValue: ApiErrorResponse }
>('auth/forgot-password', async (data, { rejectWithValue }) => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return rejectWithValue({
      timestamp: new Date().toISOString(),
      status: 0,
      message: NO_INTERNET_MESSAGE,
    });
  }
  try {
    await authService.forgotPassword(data);
  } catch (error) {
    return rejectWithValue(
      handleAuthError(error, 'Forgot password request failed')
    );
  }
});

export const resetPassword = createAsyncThunk<
  void,
  ResetPasswordPayload,
  { rejectValue: ApiErrorResponse }
>('auth/reset-password', async (data, { rejectWithValue }) => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return rejectWithValue({
      timestamp: new Date().toISOString(),
      status: 0,
      message: NO_INTERNET_MESSAGE,
    });
  }
  try {
    await authService.resetPassword(data);
  } catch (error) {
    return rejectWithValue(
      handleAuthError(error, 'Reset password request failed')
    );
  }
});
