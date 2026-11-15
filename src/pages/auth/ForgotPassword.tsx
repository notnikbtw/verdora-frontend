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

const ForgotPassword = () => {
  const dispatch = useAppDispatch();
  const { loading, errors } = useAppSelector(state => state.auth);
  const {
    handleSubmit,
    formState: { errors: formErrors, isValid },
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
    if (!canSubmit()) return;
    try {
      await dispatch(forgotPassword(data)).unwrap();
      setSend(true);
    } catch {
      // error is already stored in state.auth.error
    }
  };

  return (
    <AuthForm
      title="Forgot Password?"
      subtitle="Don’t worry! It happens. Please enter the email associated with your account."
      continueWithGoogle={false}
      footerText="Remember password?"
      footerLinkText="Log in"
      footerLink="/login"
    >
      <form
        className="flex flex-col items-center justify-center gap-6 w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextField
          type="text"
          label="Email"
          id="email"
          placeholder="Enter your email address"
          value={watch('email')}
          onChange={handleEmailChange}
          error={formErrors.email?.message}
          leftIcon={<MailIcon />}
        />
        {send && (
          <p className="text-green-500 text-sm mt-2">
            If an account with that email exists, a reset link has been sent.
          </p>
        )}
        {errors.forgot && !send && (
          <p className="text-red-500 text-sm mt-2">{errors.forgot}</p>
        )}
        <Button
          className="w-full"
          type="submit"
          disabled={!isValid || loading.forgot}
        >
          {loading.forgot ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>
    </AuthForm>
  );
};

export default ForgotPassword;
