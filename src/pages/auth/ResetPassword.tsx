import AuthForm from '@/components/layout/pageComponents/Auth';
import PasswordField from '@components/common/forms/PasswordField';
import PasswordStrength from '@components/common/forms/PasswordStrength';
import { Button } from '@components/ui/button';
import {
  useResetPasswordForm,
  type ResetPasswordFormData,
} from '@hooks/useResetPassword';
import { useAppDispatch, useAppSelector } from '@api/hooks';
import { resetPassword } from '@api/auth/auth.actions';
import { useNavigate, useSearchParams } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import { rateLimit } from '@/utils/rateLimit';
import LockIcon from '@assets/icons/lock.svg?react';

const ResetPassword = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { errors, loading } = useAppSelector(state => state.auth);
  const [success, setSuccess] = useState(false);
  const canSubmit = useMemo(() => rateLimit(2000), []);

  const {
    handleSubmit,
    formState: { errors: formErrors, isValid },
    watch,
    setValue,
  } = useResetPasswordForm();

  useEffect(() => {
    if (!token) navigate('/forgot-password', { replace: true });
  }, [token, navigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!canSubmit()) return;
    if (!token) return;
    try {
      await dispatch(
        resetPassword({ token, newPassword: data.password })
      ).unwrap();
      setSuccess(true);
    } catch {
      // error is already stored in state.auth.error
    }
  };

  if (!token) return null;

  return (
    <AuthForm
      title={success ? 'Successfully reseted' : 'New password'}
      subtitle={
        success
          ? 'Your new password was saved. Now you can log in with new password'
          : 'Create new password witch you never used'
      }
      continueWithGoogle={false}
      footerText="Remember password?"
      footerLinkText="Log in"
      footerLink="/login"
    >
      {success ? (
        <div className="flex flex-col items-center gap-4">
          <Button type="button" onClick={() => navigate('/login')}>
            Log in with new password
          </Button>
        </div>
      ) : (
        <form
          className="flex flex-col items-center justify-center gap-4 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="w-full">
            <PasswordField
              label="New password"
              placeholder="********"
              value={watch('password')}
              onChange={value =>
                setValue('password', value, { shouldValidate: true })
              }
              error={formErrors.password?.message}
              leftIcon={<LockIcon />}
            />
            <PasswordStrength password={watch('password')} />
          </div>
          <PasswordField
            label="Confirm password"
            placeholder="********"
            value={watch('confirmPassword')}
            onChange={value =>
              setValue('confirmPassword', value, { shouldValidate: true })
            }
            error={formErrors.confirmPassword?.message}
            leftIcon={<LockIcon />}
          />
          {!success && errors.reset && (
            <p className="text-red-500 text-sm">{errors.reset}</p>
          )}
          <Button type="submit" disabled={!isValid || loading.reset}>
            {loading.reset ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      )}
    </AuthForm>
  );
};

export default ResetPassword;
