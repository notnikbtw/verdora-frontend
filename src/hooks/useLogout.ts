import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@api/hooks';
import { logout } from '@api/auth/auth.actions';
import { clearCheckoutDraft } from '@/utils/checkoutDraft';
import { clearOAuthReturnTo } from '@/utils/oauthReturnTo';
import { notifyFormError } from '@/utils/form.utils';

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state => state.auth.user?.id);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
      if (userId !== undefined) clearCheckoutDraft(userId);
      clearOAuthReturnTo();
      queryClient.clear();
      navigate('/login', { replace: true });
    } catch (err) {
      // A failed server logout must not look like a successful sign-out.
      notifyFormError(err);
    } finally {
      setIsLoggingOut(false);
    }
  }, [dispatch, queryClient, navigate, userId, isLoggingOut]);

  return { handleLogout, isLoggingOut };
};

export default useLogout;
