import AuthForm from '@/components/layout/pageComponents/Auth';
import TextField from '@components/common/forms/TextField';
import { Button } from '@components/ui/button';
import {
  useForgotPasswordForm,
  type ForgotPasswordFormData,
} from '@hooks/useForgotPassword';
import { useAppDispatch, useAppSelector } from '@api/hooks';
import { forgotPassword } from '@api/auth/auth.actions';
import { useMemo, useState } from 'react';
import { rateLimit } from '@/utils/rateLimit';
import MailIcon from '@assets/icons/message.svg?react';
import { toast } from 'react-toastify';
import { focusFirstInvalidField, notifyFormError } from '@/utils/form.utils';

const ForgotPassword = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(state => state.auth);
  const {
    handleSubmit,
    formState: { errors: formErrors },
    watch,
    setValue,
  } = useForgotPasswordForm();
  const [send, setSend] = useState(false);
  const canSubmit = useMemo(() => rateLimit(2000), []);

  const handleEmailChange = (value: string) => {
    setValue('email', value, { shouldValidate: true });

    if (send) {
      setSend(false);
    }
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (loading.forgot) return;
    if (!canSubmit()) return;
    try {
      await dispatch(forgotPassword(data)).unwrap();
      setSend(true);
      toast.success(
        'If an account with that email exists, a reset link has been sent.'
      );
    } catch (error) {
      notifyFormError(error);
    }
  };

  return (
    <AuthForm
      title={send ? 'Check your email' : 'Forgot Password?'}
      subtitle={
        send
          ? 'If an account with that email exists, you will receive a reset link. Check your spam folder too.'
          : 'Enter the email associated with your account.'
      }
      continueWithGoogle={false}
      footerText="Remember password?"
      footerLinkText="Log in"
      footerLink="/login"
    >
      <form
        id="forgot-password-form"
        noValidate
        aria-busy={loading.forgot}
        className="flex flex-col items-center justify-center gap-6 w-full"
        onSubmit={handleSubmit(onSubmit, () =>
          focusFirstInvalidField('forgot-password-form')
        )}
      >
        <TextField
          type="email"
          autoComplete="email"
          required
          disabled={loading.forgot}
          label="Email"
          id="email"
          placeholder="Enter your email address"
          value={watch('email')}
          onChange={handleEmailChange}
          error={formErrors.email?.message}
          leftIcon={<MailIcon />}
        />
        <Button
          className="w-full"
          type="submit"
          disabled={loading.forgot}
          aria-busy={loading.forgot}
        >
          {loading.forgot
            ? 'Sending...'
            : send
              ? 'Send again'
              : 'Send reset link'}
        </Button>
      </form>
    </AuthForm>
  );
};

export default ForgotPassword;
