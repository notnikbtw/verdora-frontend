import { MapPin } from 'lucide-react';
import TextField from '@components/common/forms/TextField';
import { useState } from 'react';
import AddressAutocomplete from './AddressAutocomplete';
import { useAddressSearch } from '@hooks/useAddressSearch';
import type { AddressSuggestion, Settlement } from '@/schemas/address.schema';

type Props = {
  city: string;
  street: string;
  building: string;
  apartment: string;
  settlement: Settlement | null;
  onSelectSettlement: (settlement: Settlement) => void;
  onSelectStreet: (street: AddressSuggestion) => void;
  errors: {
    city?: string;
    street?: string;
    building?: string;
    apartment?: string;
  };
  onChangeField: (
    field: 'city' | 'street' | 'building' | 'apartment',
    value: string
  ) => void;
};

const DeliveryAddressForm = ({
  city,
  street,
  building,
  apartment,
  settlement,
  onSelectSettlement,
  onSelectStreet,
  errors,
  onChangeField,
}: Props) => {
  const [cityOpen, setCityOpen] = useState(false);
  const [streetOpen, setStreetOpen] = useState(false);
  const citySearch = useAddressSearch(
    'settlement',
    city,
    cityOpen && !settlement
  );
  const streetSearch = useAddressSearch(
    'street',
    street,
    streetOpen,
    settlement
  );
  const cities = (citySearch.data ?? []).filter(
    (item): item is Settlement => 'countryCode' in item
  );
  const streets = (streetSearch.data ?? []).filter(
    (item): item is AddressSuggestion => 'street' in item
  );
  return (
    <div className="space-y-4 pt-2 border-t">
      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <MapPin className="size-4 text-emerald-600" />
        Delivery Address
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-3">
          <AddressAutocomplete
            id="city"
            label="City, town or village"
            placeholder="Start typing, e.g. Kyiv or Бровари"
            value={city}
            onChange={val => onChangeField('city', val)}
            error={errors.city}
            options={cities}
            open={cityOpen && !settlement}
            onOpenChange={setCityOpen}
            onSelect={onSelectSettlement}
            isSearching={citySearch.isSearching}
            searchFailed={citySearch.isError}
            searched={citySearch.isSuccess}
            onRetry={() => void citySearch.refetch()}
            description={
              settlement
                ? `Selected: ${settlement.label}`
                : 'Delivery within Ukraine. Type at least two characters and select a result, including its region.'
            }
          />
        </div>
        <div className="sm:col-span-3">
          <AddressAutocomplete
            id="street"
            label="Street Address"
            placeholder="e.g. Khreshchatyk St"
            value={street}
            onChange={val => onChangeField('street', val)}
            error={errors.street}
            disabled={!settlement}
            options={streets}
            open={streetOpen && Boolean(settlement)}
            onOpenChange={setStreetOpen}
            onSelect={onSelectStreet}
            isSearching={streetSearch.isSearching}
            searchFailed={streetSearch.isError}
            searched={streetSearch.isSuccess}
            onRetry={() => void streetSearch.refetch()}
            description="Choose a suggestion or type the full street name if it is missing from the suggestions. House number is entered separately."
          />
        </div>
        <TextField
          type="text"
          label="Building / House"
          required
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
      <p className="text-xs leading-relaxed text-muted-foreground">
        Search data:{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          OpenStreetMap contributors
        </a>
        , search by Photon. Search text is sent to this service; your account
        details are not.
      </p>
    </div>
  );
};

export default DeliveryAddressForm;
