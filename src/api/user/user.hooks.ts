import { userService } from '@api/user/user.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';
import type {
  UpdateUserPayload,
  GetAllUsersPayload,
  UserType,
  UserProfile,
} from '@/types/user';
import type { PaginatedData } from '@/types/pagination';

type CartAxiosError = AxiosError<ApiErrorResponse>;

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, CartAxiosError, UpdateUserPayload>({
    mutationFn: payload => userService.updateUserProfile(payload),
    onSuccess: profile => {
      queryClient.setQueryData<UserType>(['profile'], current =>
        current ? { ...current, ...profile } : undefined
      );
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
  return useMutation<null, CartAxiosError, { password: string }>({
    mutationFn: data => userService.deleteUser(data),
  });
};
