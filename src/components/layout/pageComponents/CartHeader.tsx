import { Button } from '@components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type Props = {
  title?: string;
  itemsCount?: number;
  subtitle?: string;
  onBack?: () => void;
};

const CartHeader = ({
  title = 'Shopping Cart',
  itemsCount,
  subtitle,
  onBack,
}: Props) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center gap-3 mt-6">
      <Button variant="default" onClick={handleBack} aria-label="Go back">
        <ArrowLeft />
      </Button>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {itemsCount !== undefined && (
            <span className="text-lg text-gray-500 font-normal">
              ({itemsCount} items)
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default CartHeader;
