import instance, { waitForTokenRefresh } from '@api/axiosInstance';
import type { UserType } from '@/types/user';
import type { ApiResponse } from '@/types/api';
import type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '@/types/auth';

export const authService = {
  register: (data: RegisterPayload) =>
    instance.post<ApiResponse<UserType>>('/auth/register', data),

  login: (data: LoginPayload) =>
    instance.post<ApiResponse<UserType>>('/auth/login', data),

  logout: async () => {
    await waitForTokenRefresh();
    return instance.post('/auth/logout');
  },

  fetchMe: () => instance.get<ApiResponse<UserType>>('/users/current-user'),

  forgotPassword: (data: ForgotPasswordPayload) =>
    instance.post('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordPayload) =>
    instance.post('/auth/reset-password', data),
};
