import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DialogComponent from '@components/common/dialog/DialogComponent';
import TextField from '@components/common/forms/TextField';
import NoticeAlert from '@components/common/NoticeAlert';
import {
  discountFormSchema,
  setDiscountFormSchema,
  type DiscountFormData,
} from '@/schemas/discount.schema';
import type { Product } from '@/types/product';

const FIELDS = ['price', 'discountPrice'] as const;

export type DiscountFormMode = 'set' | 'edit';

type DiscountFormDialogProps = {
  product: Product | null;
  mode: DiscountFormMode;
  onSubmit: (data: DiscountFormData) => void;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  fieldErrors?: Record<string, string>;
  errorMessage?: string;
};

export const DiscountFormDialog: React.FC<DiscountFormDialogProps> = ({
  product,
  mode,
  onSubmit,
  onOpenChange,
  isPending,
  fieldErrors,
  errorMessage,
}) => {
  const form = useForm<DiscountFormData>({
    resolver: zodResolver(
      mode === 'set' ? setDiscountFormSchema : discountFormSchema
    ),
    mode: 'onChange',
  });

  const price = useWatch({ control: form.control, name: 'price' });
  const discountPrice = useWatch({
    control: form.control,
    name: 'discountPrice',
  });

  useEffect(() => {
    if (!product) return;
    const hasDiscountPrice =
      product.discountPrice !== undefined && product.discountPrice !== null;
    form.reset({
      price: String(product.price),
      // Setting a discount starts from an empty field, never from a stored 0.
      discountPrice:
        mode === 'edit' && hasDiscountPrice
          ? String(product.discountPrice)
          : undefined,
    });
  }, [product, mode, form]);

  useEffect(() => {
    FIELDS.forEach(field => {
      const message = fieldErrors?.[field];
      if (message) form.setError(field, { type: 'server', message });
    });
  }, [fieldErrors, form]);

  const hasFieldError = FIELDS.some(field => fieldErrors?.[field]);
  const otherServerErrors = Object.entries(fieldErrors ?? {})
    .filter(([key]) => !(FIELDS as readonly string[]).includes(key))
    .map(([key, message]) => `${key}: ${message}`);
  const generalError = hasFieldError
    ? otherServerErrors.join('. ')
    : [errorMessage, ...otherServerErrors].filter(Boolean).join('. ');

  const handleOpenChange = (open: boolean) => {
    if (isPending) return;
    onOpenChange(open);
    if (!open) form.reset();
  };

  const submit = form.handleSubmit(data => {
    if (!isPending) onSubmit(data);
  });

  return (
    <DialogComponent
      open={!!product}
      onOpenChange={handleOpenChange}
      headerTitle={mode === 'set' ? 'Set discount' : 'Edit discount'}
      headerDescription={
        product ? `${product.name} (#${product.productId})` : undefined
      }
      cancelText="Cancel"
      submitText={mode === 'set' ? 'Set Discount' : 'Save Changes'}
      onSubmit={submit}
      submitDisabled={!form.formState.isValid || isPending}
      autoCloseOnSubmit={false}
      loading={isPending}
    >
      <form onSubmit={submit} noValidate>
        <div className="space-y-4 py-1">
          {generalError && (
            <NoticeAlert variant="error" message={generalError} />
          )}

          <TextField
            type="number"
            label="Regular price ($)"
            id="discount-price"
            disabled={mode === 'set'}
            description={
              mode === 'set'
                ? 'The current regular price of the product.'
                : undefined
            }
            value={price || ''}
            onChange={val =>
              form.setValue('price', val, { shouldValidate: true })
            }
            error={form.formState.errors.price?.message}
          />

          <TextField
            type="number"
            label="Discount price ($)"
            id="discount-discount-price"
            placeholder={
              mode === 'set' ? 'e.g. 19.99' : 'Leave empty for no discount'
            }
            description="Must be lower than the regular price and not negative."
            value={discountPrice || ''}
            onChange={val =>
              form.setValue('discountPrice', val === '' ? undefined : val, {
                shouldValidate: true,
              })
            }
            error={form.formState.errors.discountPrice?.message}
          />
        </div>
      </form>
    </DialogComponent>
  );
};

export default DiscountFormDialog;
