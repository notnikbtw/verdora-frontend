import { Mail, LockKeyhole } from 'lucide-react';
import { Button } from '@components/ui/button';
import PasswordField from '@components/common/forms/PasswordField';
import TextField from '@components/common/forms/TextField';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoginForm, type LoginFormData } from '@hooks/useLoginForm';
import { useAppDispatch, useAppSelector } from '@api/hooks';
import { login, NO_INTERNET_MESSAGE } from '@api/auth/auth.actions';
import { clearAuthErrors, setLoginError } from '@api/auth/auth.slice';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { rateLimit } from '@/utils/rateLimit';
import { useMemo, useEffect } from 'react';
import AuthForm from '@components/layout/pageComponents/Auth';
import LinkComponent from '@components/common/Link';
import NoticeAlert from '@components/common/NoticeAlert';
import { toast } from 'react-toastify';
import { focusFirstInvalidField, notifyFormError } from '@/utils/form.utils';
import { useGuestCartSyncStatus } from '@hooks/useGuestCartSyncStatus';
import { clearOAuthReturnTo } from '@/utils/oauthReturnTo';

const Login = () => {
  const isSyncingCart = useGuestCartSyncStatus();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, errors } = useAppSelector(state => state.auth);
  const { isOnline, wasOffline, resetWasOffline } = useNetworkStatus();

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const {
    handleSubmit,
    formState: { errors: formErrors },
    watch,
    setValue,
    trigger,
  } = useLoginForm();
  const canSubmit = useMemo(() => rateLimit(2000), []);

  useEffect(() => {
    const handleOnline = () => {
      dispatch(clearAuthErrors());
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [dispatch]);

  const onSubmit = async (data: LoginFormData) => {
    if (loading.login) return;
    if (!canSubmit()) return;

    if (!isOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      dispatch(setLoginError(NO_INTERNET_MESSAGE));
      notifyFormError(NO_INTERNET_MESSAGE);
      return;
    }

    try {
      await dispatch(
        login({ email: data.email, password: data.password })
      ).unwrap();
      clearOAuthReturnTo();
      navigate(from, { replace: true });
      toast.success('You are signed in');
    } catch (error) {
      notifyFormError(error);
    }
  };

  const handleFieldChange = (field: 'email' | 'password', val: string) => {
    setValue(field, val, { shouldValidate: true });
    if (errors.login) {
      dispatch(clearAuthErrors());
    }
  };

  return (
    <AuthForm
      footerText="Don’t have an account?"
      footerLink="/register"
      footerLinkState={location.state}
      footerLinkText="Sign up"
    >
      <form
        id="login-form"
        noValidate
        aria-busy={loading.login}
        className="flex flex-col justify-center gap-4 w-full"
        onSubmit={handleSubmit(onSubmit, () =>
          focusFirstInvalidField('login-form')
        )}
      >
        {!isOnline && (
          <NoticeAlert
            variant="warning"
            title="No Internet Connection"
            message="You are currently offline. Please check your network connection and try again."
            className="w-full text-left"
          />
        )}

        {wasOffline && isOnline && !errors.login && (
          <NoticeAlert
            variant="success"
            message="Connection restored. You can now log in."
            onDismiss={resetWasOffline}
            className="w-full text-left"
          />
        )}

        <TextField
          type="email"
          autoComplete="email"
          required
          disabled={loading.login}
          label="Email"
          id="email"
          placeholder="Enter your email address"
          value={watch('email')}
          onChange={value => handleFieldChange('email', value)}
          onBlur={() => trigger('email')}
          error={formErrors.email?.message}
          leftIcon={<Mail aria-hidden="true" className="size-4" />}
        />
        <PasswordField
          required
          disabled={loading.login}
          label="Password"
          placeholder="********"
          value={watch('password')}
          onChange={value => handleFieldChange('password', value)}
          onBlur={() => trigger('password')}
          error={formErrors.password?.message}
          leftIcon={<LockKeyhole aria-hidden="true" className="size-4" />}
        />

        <div className="flex flex-col gap-2">
          <LinkComponent to="/forgot-password" text="Forgot password?" />
          <Button
            className="w-full"
            type="submit"
            disabled={loading.login}
            aria-busy={loading.login}
            variant={'outline'}
          >
            {loading.login
              ? isSyncingCart
                ? 'Transferring your cart...'
                : 'Signing in...'
              : 'Log in'}
          </Button>
        </div>
      </form>
    </AuthForm>
  );
};

export default Login;
