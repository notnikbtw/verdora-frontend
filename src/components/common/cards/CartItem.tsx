import { Button } from '@components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatOrderPrice } from '@/utils/order.utils';

type Props = {
  productName: string;
  productImage: string;
  price: number;
  discountPrice?: number | null;
  quantity: number;
  isUpdating?: boolean;
  isRemoving?: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

const CartItem = ({
  productName,
  productImage,
  price,
  discountPrice,
  quantity,
  isUpdating = false,
  isRemoving = false,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) => {
  const hasDiscount =
    discountPrice != null && discountPrice > 0 && discountPrice < price;
  const currentPrice = hasDiscount ? discountPrice : price;
  const totalPrice = currentPrice * quantity;
  const discountPercent =
    hasDiscount && price > 0
      ? Math.round(((price - discountPrice) / price) * 100)
      : 0;

  return (
    <div className="flex items-center justify-between gap-6 p-4 border rounded-2xl w-full bg-white min-h-28">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-25 h-25 shrink-0 overflow-hidden rounded-xl p-2">
          {(productImage ?? '') ? (
            <img
              src={productImage}
              alt={productName ?? 'Unknown product'}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-lg" />
          )}
        </div>

        <div className="flex flex-col justify-center min-w-0">
          <h3 className="text-lg text-[#2D2D2D] truncate">
            {productName ?? 'Unknown product'}
          </h3>
          {hasDiscount && (
            <span className="text-sm font-medium text-[#E57373] mt-0.5">
              {discountPercent}% off
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center text-center min-w-25">
        <p className="font-bold text-lg text-[#1A1A1A]">
          {formatOrderPrice(currentPrice)}
        </p>

        {hasDiscount && (
          <p className="text-sm text-gray-400 line-through mt-0.5">
            {formatOrderPrice(price)}
          </p>
        )}
      </div>

      <div className="flex gap-4 items-center rounded-full border border-gray-200 px-2 py-2 bg-white justify-between">
        <Button
          size="sm"
          onClick={onDecrease}
          disabled={quantity <= 1 || isUpdating || isRemoving}
        >
          -
        </Button>

        <span className="text-center font-medium text-base text-[#1A1A1A]">
          {quantity}
        </span>

        <Button
          size="sm"
          onClick={onIncrease}
          disabled={isUpdating || isRemoving}
        >
          +
        </Button>
      </div>

      <div className="text-right pr-8">
        <p className="font-bold text-lg text-[#1A1A1A]">
          {formatOrderPrice(totalPrice)}
        </p>
      </div>

      <Button
        size="icon-sm"
        variant="destructive"
        onClick={onRemove}
        disabled={isUpdating || isRemoving}
        aria-label={`Remove ${productName} from cart`}
      >
        <Trash2 />
      </Button>
    </div>
  );
};

export default CartItem;
