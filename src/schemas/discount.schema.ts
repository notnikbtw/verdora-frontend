import { z } from 'zod';

const createDiscountSchema = (requireDiscount: boolean) =>
  z
    .object({
      price: z
        .string()
        .min(1, 'Regular price is required')
        .refine(value => Number.isFinite(Number(value)), {
          message: 'Regular price must be a number',
        })
        .refine(
          value =>
            !value || !Number.isFinite(Number(value)) || Number(value) > 0,
          { message: 'Regular price must be greater than 0' }
        ),
      discountPrice: z
        .string()
        .optional()
        .refine(value => !requireDiscount || !!value, {
          message: 'Discount price is required',
        })
        .refine(value => !value || Number.isFinite(Number(value)), {
          message: 'Discount price must be a number',
        })
        .refine(value => !value || !(Number(value) < 0), {
          message: 'Discount price cannot be negative',
        })
        .refine(value => !value || Number(value) !== 0, {
          message: requireDiscount
            ? 'Discount price must be greater than 0.'
            : 'Discount price must be greater than 0. Leave it empty to remove the discount.',
        }),
    })
    .superRefine(({ price, discountPrice }, ctx) => {
      if (!discountPrice || !price || !(Number(price) > 0)) return;
      if (Number(discountPrice) < Number(price)) return;

      ctx.addIssue({
        code: 'custom',
        path: ['discountPrice'],
        message: 'Discount price must be lower than the regular price',
      });
      ctx.addIssue({
        code: 'custom',
        path: ['price'],
        message: `Regular price must be higher than the discount price (${discountPrice})`,
      });
    });

export const discountFormSchema = createDiscountSchema(false);
export const setDiscountFormSchema = createDiscountSchema(true);

export type DiscountFormData = z.infer<typeof discountFormSchema>;
