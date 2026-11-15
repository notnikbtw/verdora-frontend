import { userService } from '@api/user/user.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';
import type {
  UpdateUserPayload,
  GetAllUsersPayload,
  UserType,
} from '@/types/user';
import type { PaginatedData } from '@/types/pagination';

type CartAxiosError = AxiosError<ApiErrorResponse>;

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UserType,
    CartAxiosError,
    { id: number; payload: UpdateUserPayload }
  >({
    mutationFn: ({ id, payload }) => userService.updateUserProfile(payload, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useGetAllUsers = (payload: GetAllUsersPayload) => {
  return useQuery<PaginatedData<UserType>, CartAxiosError>({
    queryKey: ['users', payload],
    queryFn: () => userService.getAllUsers(payload),
  });
};

export const useGetCurrentUser = () => {
  return useQuery<UserType, CartAxiosError>({
    queryKey: ['profile'],
    queryFn: () => userService.getCurrentUser(),
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation<
    null,
    CartAxiosError,
    { id: number; data: { password: string } }
  >({
    mutationFn: ({ id, data }) => userService.deleteUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
