import { Button } from '@components/ui/button';
import PasswordField from '@components/common/forms/PasswordField';
import TextField from '@components/common/forms/TextField';
import { useNavigate, useLocation } from 'react-router';
import { useRegisterForm, type RegisterFormData } from '@hooks/useRegisterForm';
import PasswordStrength from '@components/common/forms/PasswordStrength';
import { useAppDispatch, useAppSelector } from '@api/hooks';
import { register } from '@api/auth/auth.actions';
import { rateLimit } from '@/utils/rateLimit';
import { useMemo } from 'react';
import AuthForm from '@components/layout/pageComponents/Auth';
import LinkComponent from '@components/common/Link';
import { Checkbox } from '@components/ui/checkbox';
import UserIcon from '@assets/icons/user.svg?react';
import PhoneIcon from '@assets/icons/call.svg?react';
import MailIcon from '@assets/icons/message.svg?react';
import LockIcon from '@assets/icons/lock.svg?react';
import { useGuestCartSyncStatus } from '@hooks/useGuestCartSyncStatus';
import { clearOAuthReturnTo } from '@/utils/oauthReturnTo';
import { toast } from 'react-toastify';
import { focusFirstInvalidField, notifyFormError } from '@/utils/form.utils';

const Register = () => {
  const isSyncingCart = useGuestCartSyncStatus();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useAppSelector(state => state.auth);

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const {
    handleSubmit,
    formState: { errors: formErrors },
    watch,
    setValue,
  } = useRegisterForm();

  const accepted = watch('acceptedTerms');
  const canSubmit = useMemo(() => rateLimit(2000), []);

  const onSubmit = async (data: RegisterFormData) => {
    if (loading.register) return;
    if (!canSubmit()) return;
    try {
      await dispatch(
        register({
          name: data.username,
          email: data.email,
          phone: data.phoneNumber,
          password: data.password,
        })
      ).unwrap();
      clearOAuthReturnTo();
      navigate(from, { replace: true });
      toast.success('Your account has been created');
    } catch (error) {
      notifyFormError(error);
    }
  };

  return (
    <AuthForm
      footerText="Have an account?"
      footerLink="/login"
      footerLinkState={location.state}
      footerLinkText="Log in"
    >
      <form
        id="register-form"
        noValidate
        aria-busy={loading.register}
        className="flex flex-col items-center justify-center gap-4 w-full"
        onSubmit={handleSubmit(onSubmit, () =>
          focusFirstInvalidField('register-form')
        )}
      >
        <TextField
          type="text"
          label="Full name"
          id="username"
          autoComplete="name"
          required
          disabled={loading.register}
          placeholder="Name Surname"
          value={watch('username')}
          onChange={value =>
            setValue('username', value, { shouldValidate: true })
          }
          error={formErrors.username?.message}
          leftIcon={<UserIcon />}
        />
        <TextField
          type="email"
          label="Email"
          id="email"
          autoComplete="email"
          required
          disabled={loading.register}
          placeholder="yourmail@gmail.com"
          value={watch('email')}
          onChange={value => setValue('email', value, { shouldValidate: true })}
          error={formErrors.email?.message}
          leftIcon={<MailIcon />}
        />
        <TextField
          type="tel"
          label="Phone number"
          id="phone"
          autoComplete="tel"
          required
          disabled={loading.register}
          placeholder="+38066671122"
          leftIcon={<PhoneIcon />}
          value={watch('phoneNumber')}
          onChange={value =>
            setValue('phoneNumber', value, { shouldValidate: true })
          }
          error={formErrors.phoneNumber?.message}
        />
        <div className="w-full">
          <PasswordField
            autoComplete="new-password"
            required
            disabled={loading.register}
            label="Password"
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
          autoComplete="new-password"
          required
          disabled={loading.register}
          label="Confirm Password"
          placeholder="********"
          value={watch('confirmPassword')}
          onChange={value =>
            setValue('confirmPassword', value, { shouldValidate: true })
          }
          error={formErrors.confirmPassword?.message}
          leftIcon={<LockIcon />}
        />
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="acceptedTerms"
              checked={accepted}
              disabled={loading.register}
              aria-invalid={Boolean(formErrors.acceptedTerms)}
              className="mt-0.5 shrink-0"
              onCheckedChange={checked =>
                setValue('acceptedTerms', checked === true, {
                  shouldValidate: true,
                })
              }
            />
            <label
              htmlFor="acceptedTerms"
              className="block min-w-0 text-sm text-muted-foreground cursor-pointer"
            >
              I agree to the{' '}
              <LinkComponent
                text="Terms of Service and Privacy Policy"
                to="/terms"
              />
            </label>
          </div>
          <Button
            type="submit"
            disabled={!accepted || loading.register}
            aria-busy={loading.register}
          >
            {loading.register
              ? isSyncingCart
                ? 'Transferring your cart...'
                : 'Creating account...'
              : 'Create account'}
          </Button>
        </div>
      </form>
    </AuthForm>
  );
};

export default Register;
