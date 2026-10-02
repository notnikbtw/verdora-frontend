import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '@api/hooks';
import { logout } from '@api/auth/auth.actions';
import type { ApiErrorResponse } from '@/types/api';

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
      queryClient.clear();
      navigate('/login');
    } catch (err) {
      // If the logout failure is not due to offline (status !== 0, e.g. 401, 500, 503),
      // auth.slice.ts clears the Redux user state.
      // Clear React Query cache (profile, cart, orders) and redirect to /login,
      // skipping only when offline (status === 0) so session remains intact locally.
      if ((err as ApiErrorResponse)?.status !== 0) {
        queryClient.clear();
        navigate('/login');
      }
    } finally {
      setIsLoggingOut(false);
    }
  }, [dispatch, queryClient, navigate]);

  return { handleLogout, isLoggingOut };
};

export default useLogout;
