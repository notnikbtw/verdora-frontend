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

const Register = () => {
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
  } = useRegisterForm();

  const accepted = watch('acceptedTerms');
  const canSubmit = useMemo(() => rateLimit(2000), []);

  const onSubmit = async (data: RegisterFormData) => {
    if (!canSubmit()) return;
    await dispatch(
      register({
        name: data.username,
        email: data.email,
        phone: data.phoneNumber,
        password: data.password,
      })
    ).unwrap();
    navigate(from, { replace: true });
  };

  return (
    <AuthForm
      footerText="Have an account?"
      footerLink="/login"
      footerLinkState={location.state}
      footerLinkText="Log in"
    >
      <form
        className="flex flex-col items-center justify-center gap-4 w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextField
          type="text"
          label="Full name"
          id="username"
          placeholder="Name Surname"
          value={watch('username')}
          onChange={value =>
            setValue('username', value, { shouldValidate: true })
          }
          error={formErrors.username?.message}
          leftIcon={<UserIcon />}
        />
        <TextField
          type="text"
          label="Email"
          id="email"
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
          <div className="flex items-center gap-1">
            <Checkbox
              id="acceptedTerms"
              checked={accepted}
              onCheckedChange={checked =>
                setValue('acceptedTerms', checked === true, {
                  shouldValidate: true,
                })
              }
            />
            <label
              htmlFor="acceptedTerms"
              className="text-sm text-[#888888] [font-family:var(--font-sans)] cursor-pointer"
            >
              Agreed with
            </label>
            <LinkComponent text="Terms and Conditions" to="/terms" />
          </div>
          {errors.register && (
            <p className="text-red-500 text-sm mt-2 text-center">
              {errors.register}
            </p>
          )}
          <Button
            type="submit"
            disabled={!isValid || !accepted || loading.register}
          >
            {loading.register ? 'Creating...' : 'Log in'}
          </Button>
        </div>
      </form>
    </AuthForm>
  );
};

export default Register;
