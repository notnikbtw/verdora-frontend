import { Store } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { cn } from '@/lib/utils';

export type PickupLocation = {
  id: string;
  name: string;
  address: string;
};

type Props = {
  locations: PickupLocation[];
  selectedLocationId: string;
  onSelectLocation: (id: string) => void;
};

const PickupLocationSelector = ({
  locations,
  selectedLocationId,
  onSelectLocation,
}: Props) => {
  return (
    <div className="space-y-4 pt-2 border-t">
      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <Store className="size-4 text-emerald-600" />
        Select Pickup Location
      </h4>
      <div className="space-y-3">
        {locations.map(loc => (
          <label
            key={loc.id}
            className={cn(
              'flex items-center justify-between gap-3 p-3.5 rounded-xl border cursor-pointer transition-all',
              selectedLocationId === loc.id
                ? 'border-emerald-600 bg-emerald-50/30'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <input
                type="radio"
                name="pickupLocation"
                value={loc.id}
                checked={selectedLocationId === loc.id}
                onChange={() => onSelectLocation(loc.id)}
                className="shrink-0 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="min-w-0 break-words">
                <p className="text-sm font-medium text-gray-900">{loc.name}</p>
                <p className="text-xs text-gray-500">{loc.address}</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 text-xs text-emerald-700 border-emerald-300 bg-emerald-50"
            >
              Free
            </Badge>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PickupLocationSelector;
