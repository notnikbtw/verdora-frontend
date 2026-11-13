import { useNavigate, useLocation, Link } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import {
  Heart,
  ShoppingBag,
  PackageCheck,
  UserCheck,
  LogIn,
} from 'lucide-react';

export type AuthPromptAction =
  'favorite' | 'checkout' | 'orders' | 'profile' | 'general';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: AuthPromptAction;
  title?: string;
  description?: string;
};

const getActionDetails = (action: AuthPromptAction) => {
  switch (action) {
    case 'favorite':
      return {
        defaultDescription:
          'You need to be logged in to save items to your favourites.',
        icon: (
          <Heart className="size-7 text-[#FA1105] stroke-[1.8] fill-[#FA1105]/10" />
        ),
      };
    case 'checkout':
      return {
        defaultDescription:
          'You need to be logged in to complete your checkout and place an order.',
        icon: <ShoppingBag className="size-7 text-primary stroke-[1.8]" />,
      };
    case 'orders':
      return {
        defaultDescription:
          'You need to be logged in to view and track your orders.',
        icon: <PackageCheck className="size-7 text-primary stroke-[1.8]" />,
      };
    case 'profile':
      return {
        defaultDescription:
          'You need to be logged in to manage your profile and account settings.',
        icon: <UserCheck className="size-7 text-primary stroke-[1.8]" />,
      };
    case 'general':
    default:
      return {
        defaultDescription:
          'Please sign in or create an account to access this feature.',
        icon: <LogIn className="size-7 text-primary stroke-[1.8]" />,
      };
  }
};

export const LoginPromptDialog = ({
  open,
  onOpenChange,
  action = 'favorite',
  title = 'Please Log In',
  description,
}: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnLocation =
    action === 'checkout' ? { pathname: '/checkout' } : location;

  const handleLoginClick = () => {
    onOpenChange(false);
    navigate('/login', { state: { from: returnLocation } });
  };

  const { defaultDescription, icon } = getActionDetails(action);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-3xl p-6 text-center">
        <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>

        <DialogHeader className="text-center sm:text-center space-y-1.5">
          <DialogTitle className="text-xl font-heading font-semibold text-text-h">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-text-muted">
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center gap-2.5 w-full">
            <Button
              type="button"
              variant="outline"
              className="flex-1 cursor-pointer rounded-xl h-10 border-border font-medium"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-10 shadow-xs font-medium"
              onClick={handleLoginClick}
            >
              Log In
            </Button>
          </div>

          <p className="text-xs text-center text-text-muted">
            Don't have an account?{' '}
            <Link
              to="/register"
              state={{ from: returnLocation }}
              onClick={() => onOpenChange(false)}
              className="font-medium text-primary hover:underline cursor-pointer"
            >
              Sign up
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPromptDialog;
