import { PICKUP_LOCATIONS } from '@/config/checkout.config';
import type { CheckoutFormData } from '@/schemas/checkout.schema';
import type { CheckoutPayload } from '@/types/order';

type DeliveryFields = Pick<
  CheckoutFormData,
  'deliveryMethod' | 'pickupLocationId' | 'street' | 'building' | 'apartment'
>;

// Quote and order creation must use exactly the same delivery details.
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

  const street = data.street?.trim();
  const building = data.building?.trim();
  const apartment = data.apartment?.trim();
  if (!street || !building) return null;

  const deliveryAddress = [
    street,
    building,
    apartment ? `Apt ${apartment}` : null,
  ]
    .filter(Boolean)
    .join(', ');
  if (deliveryAddress.length > 512) return null;
  return { deliveryMethod: 'COURIER_DELIVERY', deliveryAddress };
};
