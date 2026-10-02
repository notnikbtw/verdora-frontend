import { Button } from '@components/ui/button';
import PasswordField from '@components/common/forms/PasswordField';
import TextField from '@components/common/forms/TextField';
import { useNavigate } from 'react-router';
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
import MailIcon from '@assets/icons/message.svg?react';
import LockIcon from '@assets/icons/lock.svg?react';
import { RefreshCw } from 'lucide-react';

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, errors } = useAppSelector(state => state.auth);
  const { isOnline, wasOffline, resetWasOffline } = useNetworkStatus();

  const {
    handleSubmit,
    formState: { errors: formErrors, isValid },
    watch,
    setValue,
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
    if (!canSubmit()) return;

    if (!isOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      dispatch(setLoginError(NO_INTERNET_MESSAGE));
      return;
    }

    try {
      await dispatch(
        login({ email: data.email, password: data.password })
      ).unwrap();
      navigate('/');
    } catch {
      // Error handled by auth slice and displayed in UI
    }
  };

  const handleFieldChange = (field: 'email' | 'password', val: string) => {
    setValue(field, val, { shouldValidate: true });
    if (errors.login) {
      dispatch(clearAuthErrors());
    }
  };

  const isNetworkIssue =
    errors.login?.toLowerCase().includes('internet') ||
    errors.login?.toLowerCase().includes('network');

  return (
    <AuthForm
      footerText="Don’t have an account?"
      footerLink="/register"
      footerLinkText="Sign up"
    >
      <form
        className="flex flex-col justify-center gap-4 w-full"
        onSubmit={handleSubmit(onSubmit)}
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
          type="text"
          label="Email"
          id="email"
          placeholder="Enter your email address"
          value={watch('email')}
          onChange={value => handleFieldChange('email', value)}
          error={formErrors.email?.message}
          leftIcon={<MailIcon />}
        />
        <PasswordField
          label="Password"
          placeholder="********"
          value={watch('password')}
          onChange={value => handleFieldChange('password', value)}
          error={formErrors.password?.message}
          leftIcon={<LockIcon />}
        />

        {errors.login && (
          <NoticeAlert
            variant="error"
            title={isNetworkIssue ? 'Connection Error' : undefined}
            message={errors.login}
            onDismiss={() => dispatch(clearAuthErrors())}
            action={
              isNetworkIssue ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading.login || !isValid}
                  className="h-6 px-2 text-xs text-rose-800 hover:text-rose-950 hover:bg-rose-100"
                >
                  <RefreshCw className="size-3 mr-1" />
                  Retry
                </Button>
              ) : undefined
            }
            className="w-full text-left"
          />
        )}

        <div className="flex flex-col gap-2">
          <LinkComponent to="/forgot-password" text="Forgot password?" />
          <Button
            className="w-full"
            type="submit"
            disabled={!isValid || loading.login}
            variant={'outline'}
          >
            {loading.login ? 'Signing in...' : 'Log in'}
          </Button>
        </div>
      </form>
    </AuthForm>
  );
};

export default Login;
