import { createAsyncThunk } from '@reduxjs/toolkit';
import type { UserType } from '@/types/user';
import { isAxiosError } from 'axios';
import type { ApiResponse, ApiErrorResponse } from '@/types/api';
import { authService } from '@api/auth/auth.service';
import type {
  ForgotPasswordPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from '@/types/auth';

import {
  syncGuestCartToBackend,
  clearGuestCart,
  getGuestCartSyncError,
} from '@/utils/guestCart';

export const register = createAsyncThunk<
  ApiResponse<UserType>,
  RegisterPayload,
  { rejectValue: ApiErrorResponse }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.register(userData);
    // Sync guest cart in background without blocking the auth flow
    syncGuestCartToBackend().catch(e => {
      console.warn('Failed to sync guest cart on register', e);
    });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      return rejectWithValue(error.response?.data);
    }
    throw error;
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
    try {
      const response = await authService.login(userData);
      // Sync guest cart in background without blocking the auth flow
      syncGuestCartToBackend().catch(e => {
        console.warn('Failed to sync guest cart on login', e);
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        return rejectWithValue(error.response?.data);
      }
      throw error;
    }
  }
);

export const logout = createAsyncThunk<
  void,
  void,
  { rejectValue: ApiErrorResponse }
>('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    clearGuestCart();
  } catch (error) {
    if (isAxiosError(error)) {
      return rejectWithValue(error.response?.data);
    }
    throw error;
  }
});

export const fetchMe = createAsyncThunk<
  ApiResponse<UserType>,
  void,
  { rejectValue: ApiErrorResponse }
>('auth/me', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.fetchMe();
    // Sync guest cart in background only if there is no previous persistent failure
    if (!getGuestCartSyncError()) {
      syncGuestCartToBackend().catch(e => {
        console.warn('Failed to sync guest cart on fetchMe', e);
      });
    }
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      return rejectWithValue(error.response?.data);
    }
    throw error;
  }
});

export const forgotPassword = createAsyncThunk<
  void,
  ForgotPasswordPayload,
  { rejectValue: ApiErrorResponse }
>('auth/forgot-password', async (data, { rejectWithValue }) => {
  try {
    await authService.forgotPassword(data);
  } catch (error) {
    if (isAxiosError(error)) {
      return rejectWithValue(error.response?.data);
    }
    throw error;
  }
});

export const resetPassword = createAsyncThunk<
  void,
  ResetPasswordPayload,
  { rejectValue: ApiErrorResponse }
>('auth/reset-password', async (data, { rejectWithValue }) => {
  try {
    await authService.resetPassword(data);
  } catch (error) {
    if (isAxiosError(error)) {
      return rejectWithValue(error.response?.data);
    }
    throw error;
  }
});
