import { Truck, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatOrderPrice } from '@/utils/order.utils';

type Props = {
  selectedMethod: 'delivery' | 'pickup';
  onSelectMethod: (method: 'delivery' | 'pickup') => void;
  baseShippingCost: number;
};

const DeliveryMethodSelector = ({
  selectedMethod,
  onSelectMethod,
  baseShippingCost,
}: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onSelectMethod('delivery')}
        className={cn(
          'flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer',
          selectedMethod === 'delivery'
            ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        )}
      >
        <div
          className={cn(
            'p-2 rounded-lg shrink-0 mt-0.5',
            selectedMethod === 'delivery'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-600'
          )}
        >
          <Truck className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-sm text-gray-900">
              Courier Delivery
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              {formatOrderPrice(baseShippingCost)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Direct to your home or office address
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelectMethod('pickup')}
        className={cn(
          'flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer',
          selectedMethod === 'pickup'
            ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        )}
      >
        <div
          className={cn(
            'p-2 rounded-lg shrink-0 mt-0.5',
            selectedMethod === 'pickup'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-600'
          )}
        >
          <Store className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-sm text-gray-900">
              Store Pickup
            </span>
            <span className="text-xs font-semibold text-emerald-700">Free</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Pick up directly from one of our locations
          </p>
        </div>
      </button>
    </div>
  );
};

export default DeliveryMethodSelector;
