import { formatCurrency } from '@/utils/order.utils';
import { cn } from '@/lib/utils';

type Props = {
  price: number;
  discountPrice?: number | null;
  className?: string;
};

const HomeProductPrice = ({ price, discountPrice, className }: Props) => {
  const hasDiscount =
    discountPrice != null && discountPrice > 0 && discountPrice < price;

  return (
    <div
      className={cn(
        'flex flex-wrap items-baseline gap-x-3 gap-y-1 tabular-nums',
        className
      )}
    >
      <span className="text-2xl font-semibold tracking-tight text-primary">
        {hasDiscount && <span className="sr-only">Sale price: </span>}
        {formatCurrency(hasDiscount ? discountPrice : price)}
      </span>
      {hasDiscount && (
        <span className="text-sm text-muted-foreground line-through">
          <span className="sr-only">Original price: </span>
          {formatCurrency(price)}
        </span>
      )}
    </div>
  );
};

export default HomeProductPrice;
