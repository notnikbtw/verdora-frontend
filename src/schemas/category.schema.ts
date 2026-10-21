import { z } from 'zod';

export const adminCategorySchema = z.object({
  category: z.string().min(1, 'Min 1 characters').max(50, 'Max 50 characters'),
  imageUrl: z
    .string()
    .max(500, 'Max 500 characters')
    .refine(value => value === '' || /^https?:\/\/\S+$/i.test(value), {
      message: 'Enter a valid http(s) URL',
    }),
});
