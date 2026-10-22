import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/utils';

type Props = {
  text: string;
  to: string;
  state?: unknown;
  className?: string;
  // Overrides the default pathname match, for links that share a path.
  isActive?: boolean;
};

const LinkComponent = ({ text, to, className, state, isActive }: Props) => {
  const currentLocation = useLocation();

  return (
    <Link
      to={to}
      state={state}
      className={cn(
        'cursor-pointer text-[16px] font-semibold text-text hover:text-link-text hover:underline transition-colors duration-100',
        className,
        (isActive ?? currentLocation.pathname === to) &&
          'text-link-text underline'
      )}
    >
      {text}
    </Link>
  );
};

export default LinkComponent;
