import { z } from 'zod';
import { emailSchema, phoneNumberSchema } from '@/schemas/fields.schema';
import { PICKUP_LOCATIONS } from '@/config/checkout.config';
import { formatDeliveryAddress } from '@/utils/checkout.utils';
import { settlementSchema } from '@/schemas/address.schema';
import {
  isSelectedSettlement,
  isStreetName,
  isBuildingNumber,
} from '@/utils/address.utils';

export const checkoutSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: emailSchema,
    phone: phoneNumberSchema,
    deliveryMethod: z.enum(['delivery', 'pickup']),
    pickupLocationId: z.string().optional(),
    city: z.string().max(100, 'City name is too long').optional(),
    settlement: settlementSchema.nullable().optional(),
    street: z.string().max(400, 'Address is too long').optional(),
    building: z.string().max(50, 'Building number is too long').optional(),
    apartment: z.string().max(50, 'Apartment number is too long').optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.deliveryMethod === 'pickup' &&
      !PICKUP_LOCATIONS.some(location => location.id === data.pickupLocationId)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a pickup location',
        path: ['pickupLocationId'],
      });
    }
    if (data.deliveryMethod === 'delivery') {
      if (!data.city?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'City is required',
          path: ['city'],
        });
      } else if (!isSelectedSettlement(data.city, data.settlement)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select a settlement in Ukraine from the suggestions',
          path: ['city'],
        });
      }
      if (!data.street || data.street.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Street address is required',
          path: ['street'],
        });
      } else if (!isStreetName(data.street)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a street name, not only a number',
          path: ['street'],
        });
      }
      if (!data.building || data.building.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Building number is required',
          path: ['building'],
        });
      } else if (!isBuildingNumber(data.building)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a house number, e.g. 15, 15Б or 15/2',
          path: ['building'],
        });
      }
      if (formatDeliveryAddress(data).length > 512) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Full delivery address must be at most 512 characters',
          path: ['street'],
        });
      }
    }
  });

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
