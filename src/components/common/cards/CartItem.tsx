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
    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 sm:p-4 border rounded-2xl w-full bg-white min-w-0">
      <Button
        size="icon-sm"
        variant="destructive"
        onClick={onRemove}
        disabled={isUpdating || isRemoving}
        aria-label={`Remove ${productName} from cart`}
        className="absolute top-3 right-3 sm:hidden"
      >
        <Trash2 className="size-4" />
      </Button>

      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-8 sm:pr-0">
        <div className="size-20 sm:size-24 shrink-0 overflow-hidden rounded-xl p-1 bg-gray-50 flex items-center justify-center">
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
          <h3 className="text-base sm:text-lg font-medium text-[#2D2D2D] truncate">
            {productName ?? 'Unknown product'}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="font-semibold text-sm sm:text-base text-[#1A1A1A]">
              {formatOrderPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                {formatOrderPrice(price)}
              </span>
            )}
          </div>

          {hasDiscount && (
            <span className="text-xs font-medium text-[#E57373] mt-0.5">
              {discountPercent}% off
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full sm:w-auto">
        <div className="flex items-center gap-2 sm:gap-3 rounded-full border border-gray-200 px-2 py-1 bg-white">
          <Button
            size="sm"
            onClick={onDecrease}
            disabled={quantity <= 1 || isUpdating || isRemoving}
            className="h-7 w-7 p-0 sm:h-8 sm:w-8"
          >
            -
          </Button>

          <span className="text-center font-medium text-sm sm:text-base text-[#1A1A1A] min-w-6">
            {quantity}
          </span>

          <Button
            size="sm"
            onClick={onIncrease}
            disabled={isUpdating || isRemoving}
            className="h-7 w-7 p-0 sm:h-8 sm:w-8"
          >
            +
          </Button>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-400 block sm:hidden">Total:</span>
          <p className="font-bold text-base sm:text-lg text-[#1A1A1A]">
            {formatOrderPrice(totalPrice)}
          </p>
        </div>

        <Button
          size="icon-sm"
          variant="destructive"
          onClick={onRemove}
          disabled={isUpdating || isRemoving}
          aria-label={`Remove ${productName} from cart`}
          className="hidden sm:inline-flex"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
