import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@components/ui/card';
import { Button } from '@components/ui/button';
import LinkComponent from '@components/common/Link';
import AuthImg from '@assets/images/frame1.png';
import Logo from '@components/common/Logo';

type AuthFormProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footerText: string;
  footerLink: string;
  footerLinkState?: unknown;
  footerLinkText: string;
  onGoogleAuth?: () => void;
  continueWithGoogle?: boolean;
};

const defaultGoogleAuth = () => {
  const returnTo = encodeURIComponent(
    window.location.origin + import.meta.env.BASE_URL
  );
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google?return_to=${returnTo}`;
};

const AuthForm = ({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLinkState,
  footerLinkText,
  onGoogleAuth = defaultGoogleAuth,
  continueWithGoogle = true,
}: AuthFormProps) => {
  return (
    <div className="flex min-h-screen w-full bg-[#ECECEC] dark:bg-zinc-950">
      <div className="hidden lg:block lg:w-1/2 relative min-h-screen overflow-hidden">
        <img
          src={AuthImg}
          alt="Authentication visual"
          className="w-full h-full object-cover absolute inset-0"
        />
      </div>

      <div className="flex flex-col flex-1 w-full lg:w-1/2 justify-between items-center p-0 sm:p-8 lg:p-10 min-h-screen">
        <div className="w-full flex justify-center pt-8 pb-6 sm:pt-2 sm:pb-2">
          <Logo />
        </div>

        <div className="flex-1 flex items-end sm:items-center justify-center w-full">
          <Card className="w-full max-w-full sm:max-w-[440px] bg-white dark:bg-zinc-900 rounded-t-[36px] rounded-b-none sm:rounded-[28px] border-0 shadow-sm p-6 sm:p-8 flex flex-col justify-start gap-4 sm:gap-5 flex-1 sm:flex-initial">
            {title && (
              <CardHeader className="text-center space-y-1 pb-1 px-0">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  {title}
                </CardTitle>
                {subtitle && (
                  <CardDescription className="text-sm text-muted-foreground">
                    {subtitle}
                  </CardDescription>
                )}
              </CardHeader>
            )}
            <CardContent className="px-0 py-0">{children}</CardContent>
            <CardFooter className="flex flex-col gap-3 px-0 pt-2">
              {continueWithGoogle && onGoogleAuth && (
                <div className="flex flex-col gap-3 w-full">
                  <div className="w-full flex gap-3 items-center my-1">
                    <div className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
                    <p className="text-xs text-zinc-500 mx-1">
                      Or continue with
                    </p>
                    <div className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
                  </div>
                  <Button
                    onClick={onGoogleAuth}
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl py-5 text-sm font-medium border-zinc-200 dark:border-zinc-700"
                  >
                    Continue with Google
                  </Button>
                </div>
              )}
              <div className="flex items-center justify-center gap-1 mt-1 text-sm">
                <p className="text-zinc-500">{footerText}</p>
                <LinkComponent
                  to={footerLink}
                  state={footerLinkState}
                  text={footerLinkText}
                  className="font-bold text-black dark:text-white hover:underline"
                />
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="h-4 hidden lg:block" />
      </div>
    </div>
  );
};

export default AuthForm;
