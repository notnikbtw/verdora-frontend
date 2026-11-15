import { MapPin } from 'lucide-react';
import TextField from '@components/common/forms/TextField';

type Props = {
  street: string;
  building: string;
  apartment: string;
  errors: {
    street?: string;
    building?: string;
    apartment?: string;
  };
  onChangeField: (
    field: 'street' | 'building' | 'apartment',
    value: string
  ) => void;
};

const DeliveryAddressForm = ({
  street,
  building,
  apartment,
  errors,
  onChangeField,
}: Props) => {
  return (
    <div className="space-y-4 pt-2 border-t">
      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <MapPin className="size-4 text-emerald-600" />
        Delivery Address
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-3">
          <TextField
            type="text"
            label="Street Address"
            id="street"
            placeholder="e.g. Khreshchatyk St"
            value={street}
            onChange={val => onChangeField('street', val)}
            error={errors.street}
          />
        </div>
        <TextField
          type="text"
          label="Building / House"
          id="building"
          placeholder="e.g. 15B"
          value={building}
          onChange={val => onChangeField('building', val)}
          error={errors.building}
        />
        <TextField
          type="text"
          label="Apartment / Suite"
          id="apartment"
          placeholder="e.g. Apt 42"
          value={apartment}
          onChange={val => onChangeField('apartment', val)}
          error={errors.apartment}
        />
      </div>
    </div>
  );
};

export default DeliveryAddressForm;
