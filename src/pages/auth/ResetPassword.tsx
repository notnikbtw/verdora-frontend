import { LockKeyhole } from 'lucide-react';
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
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { rateLimit } from '@/utils/rateLimit';
import { toast } from 'react-toastify';
import { focusFirstInvalidField, notifyFormError } from '@/utils/form.utils';

const ResetPassword = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { loading } = useAppSelector(state => state.auth);
  const [success, setSuccess] = useState(false);
  const canSubmit = useMemo(() => rateLimit(2000), []);

  const {
    handleSubmit,
    formState: { errors: formErrors },
    watch,
    setValue,
  } = useResetPasswordForm();

  useEffect(() => {
    if (!token) navigate('/forgot-password', { replace: true });
  }, [token, navigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (loading.reset) return;
    if (!canSubmit()) return;
    if (!token) return;
    try {
      await dispatch(
        resetPassword({ token, newPassword: data.password })
      ).unwrap();
      setSuccess(true);
      toast.success('Your password has been reset');
    } catch (error) {
      notifyFormError(error);
    }
  };

  if (!token) return null;

  return (
    <AuthForm
      title={success ? 'Password reset' : 'New password'}
      subtitle={
        success
          ? 'Your new password was saved. You can now log in.'
          : 'Choose a new password that you have not used before.'
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
          id="reset-password-form"
          noValidate
          aria-busy={loading.reset}
          className="flex flex-col items-center justify-center gap-4 w-full"
          onSubmit={handleSubmit(onSubmit, () =>
            focusFirstInvalidField('reset-password-form')
          )}
        >
          <div className="w-full">
            <PasswordField
              autoComplete="new-password"
              required
              disabled={loading.reset}
              label="New password"
              placeholder="********"
              value={watch('password')}
              onChange={value =>
                setValue('password', value, { shouldValidate: true })
              }
              error={formErrors.password?.message}
              leftIcon={<LockKeyhole aria-hidden="true" className="size-4" />}
            />
            <PasswordStrength password={watch('password')} />
          </div>
          <PasswordField
            autoComplete="new-password"
            required
            disabled={loading.reset}
            label="Confirm password"
            placeholder="********"
            value={watch('confirmPassword')}
            onChange={value =>
              setValue('confirmPassword', value, { shouldValidate: true })
            }
            error={formErrors.confirmPassword?.message}
            leftIcon={<LockKeyhole aria-hidden="true" className="size-4" />}
          />
          <Button
            type="submit"
            disabled={loading.reset}
            aria-busy={loading.reset}
          >
            {loading.reset ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      )}
    </AuthForm>
  );
};

export default ResetPassword;
