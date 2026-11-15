import { z } from 'zod';
import { phoneNumberSchema } from '@/schemas/fields.schema';

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name is too short (min 2 characters)')
    .max(50, 'Name is too long (max 50 characters)'),
  phone: phoneNumberSchema,
});

export type ProfileFormData = z.infer<typeof profileSchema>;
