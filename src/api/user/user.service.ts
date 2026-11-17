import instance from '@api/axiosInstance';
import type { ApiResponse } from '@/types/api';
import type {
  GetAllUsersPayload,
  UpdateUserPayload,
  UserType,
  UserProfile,
} from '@/types/user';
import type { PaginatedData } from '@/types/pagination';

export const userService = {
  updateUserProfile: async (data: UpdateUserPayload) => {
    const response = await instance.put<ApiResponse<UserProfile>>(
      '/users/current-user',
      data
    );
    return response.data.data;
  },

  getAllUsers: async (payload: GetAllUsersPayload) => {
    const response = await instance.get<ApiResponse<PaginatedData<UserType>>>(
      '/users',
      {
        params: payload,
      }
    );
    return response.data.data;
  },

  getCurrentUser: async () => {
    const response = await instance.get<ApiResponse<UserType>>(
      '/users/current-user'
    );
    return response.data.data;
  },

  deleteUser: async (data: { password: string }) => {
    const response = await instance.delete<ApiResponse<null>>(
      '/users/current-user',
      {
        data,
      }
    );
    return response.data.data;
  },
};
