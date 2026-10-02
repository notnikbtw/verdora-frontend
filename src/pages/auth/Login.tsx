import { Button } from '@components/ui/button';
import PasswordField from '@components/common/forms/PasswordField';
import TextField from '@components/common/forms/TextField';
import { useNavigate, useLocation } from 'react-router';
import { useLoginForm, type LoginFormData } from '@hooks/useLoginForm';
import { useAppDispatch, useAppSelector } from '@api/hooks';
import { login } from '@api/auth/auth.actions';
import { rateLimit } from '@/utils/rateLimit';
import { useMemo } from 'react';
import AuthForm from '@components/layout/pageComponents/Auth';
import LinkComponent from '@components/common/Link';
import MailIcon from '@assets/icons/message.svg?react';
import LockIcon from '@assets/icons/lock.svg?react';

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, errors } = useAppSelector(state => state.auth);

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const {
    handleSubmit,
    formState: { errors: formErrors, isValid },
    watch,
    setValue,
  } = useLoginForm();
  const canSubmit = useMemo(() => rateLimit(2000), []);

  const onSubmit = async (data: LoginFormData) => {
    if (!canSubmit()) return;
    try {
      await dispatch(
        login({ email: data.email, password: data.password })
      ).unwrap();
      navigate(from, { replace: true });
    } catch {
      // Error handled by auth slice and displayed in UI
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
        className="flex flex-col justify-center gap-4 w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextField
          type="text"
          label="Email"
          id="email"
          placeholder="Enter your email address"
          value={watch('email')}
          onChange={value => setValue('email', value, { shouldValidate: true })}
          error={formErrors.email?.message}
          leftIcon={<MailIcon />}
        />
        <PasswordField
          label="Password"
          placeholder="********"
          value={watch('password')}
          onChange={value =>
            setValue('password', value, { shouldValidate: true })
          }
          error={formErrors.password?.message}
          leftIcon={<LockIcon />}
        />
        {errors.login && (
          <p className="text-red-500 text-sm text-center">{errors.login}</p>
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
