import { Link } from 'react-router';
import { cn } from '@/lib/utils';

type LogoProps = {
  fontSize?: string;
  className?: string;
};

const Logo = ({ fontSize = 'text-5xl', className }: LogoProps) => {
  return (
    <Link to="/">
      <span
        className={cn('font-sans text-primary font-black', fontSize, className)}
      >
        Verdora
      </span>
    </Link>
  );
};

export default Logo;
