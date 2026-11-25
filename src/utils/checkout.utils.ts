import { PICKUP_LOCATIONS } from '@/config/checkout.config';
import type { CheckoutFormData } from '@/schemas/checkout.schema';
import type { CheckoutPayload } from '@/types/order';
import type { Settlement } from '@/schemas/address.schema';
import {
  isSelectedSettlement,
  isStreetName,
  isBuildingNumber,
} from '@/utils/address.utils';

type DeliveryFields = Pick<
  CheckoutFormData,
  | 'deliveryMethod'
  | 'pickupLocationId'
  | 'city'
  | 'settlement'
  | 'street'
  | 'building'
  | 'apartment'
>;

export const formatDeliveryAddress = (data: {
  city?: string;
  settlement?: Settlement | null;
  street?: string;
  building?: string;
  apartment?: string;
}): string => {
  const apartment = data.apartment?.trim();
  return [
    data.settlement?.label || data.city?.trim(),
    data.street?.trim(),
    data.building?.trim(),
    apartment ? `Apt ${apartment}` : null,
  ]
    .filter(Boolean)
    .join(', ');
};

export const buildCheckoutPayload = (
  data: DeliveryFields
): CheckoutPayload | null => {
  if (data.deliveryMethod === 'pickup') {
    const location = PICKUP_LOCATIONS.find(
      item => item.id === data.pickupLocationId
    );
    return location
      ? {
          deliveryMethod: 'STORE_PICKUP',
          pickupPointId: location.pickupPointId,
        }
      : null;
  }

  if (
    !isSelectedSettlement(data.city, data.settlement) ||
    !data.street ||
    !isStreetName(data.street) ||
    !data.building ||
    !isBuildingNumber(data.building)
  )
    return null;

  const deliveryAddress = formatDeliveryAddress(data);
  if (deliveryAddress.length > 512) return null;
  return { deliveryMethod: 'COURIER_DELIVERY', deliveryAddress };
};
