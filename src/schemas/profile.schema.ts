import { z } from 'zod';
import { phoneNumberSchema } from '@/schemas/fields.schema';

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name is too short (min 2 characters)')
    .max(256, 'Name is too long (max 256 characters)'),
  phone: z
    .string()
    .trim()
    .pipe(phoneNumberSchema.or(z.literal(''))),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
