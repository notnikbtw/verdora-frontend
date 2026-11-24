import { z } from 'zod';
import { emailSchema, phoneNumberSchema } from '@/schemas/fields.schema';
import { PICKUP_LOCATIONS } from '@/config/checkout.config';

export const checkoutSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: emailSchema,
    phone: phoneNumberSchema,
    deliveryMethod: z.enum(['delivery', 'pickup']),
    pickupLocationId: z.string().optional(),
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
      if (!data.street || data.street.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Street address is required',
          path: ['street'],
        });
      }
      if (!data.building || data.building.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Building number is required',
          path: ['building'],
        });
      }
    }
  });

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
