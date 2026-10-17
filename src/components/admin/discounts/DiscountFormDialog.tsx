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
  open: boolean;
  product: Product | null;
  mode: DiscountFormMode;
  onSubmit: (data: DiscountFormData) => void;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  fieldErrors?: Record<string, string>;
  errorMessage?: string;
};

export const DiscountFormDialog: React.FC<DiscountFormDialogProps> = ({
  open,
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

  // Reset when the dialog opens, not when it closes: the closing animation
  // still shows the form, and a reopened form must not keep old input.
  useEffect(() => {
    if (!open || !product) return;
    const hasDiscountValue =
      product.discountPrice !== undefined && product.discountPrice !== null;
    form.reset({
      price: String(product.price),
      // Setting a discount starts from an empty field, never from a stored 0.
      discountPrice:
        mode === 'edit' && hasDiscountValue
          ? String(product.discountPrice)
          : undefined,
    });
  }, [open, product, mode, form]);

  useEffect(() => {
    FIELDS.forEach(field => {
      const message = fieldErrors?.[field];
      if (message) form.setError(field, { type: 'server', message });
    });
  }, [fieldErrors, form]);

  // The schema's cross-field rule attaches errors to both fields, so changing
  // either one has to re-check both, or a stale message stays on the other.
  const updateField = (
    name: 'price' | 'discountPrice',
    value: string | undefined
  ) => {
    form.setValue(name, value);
    void form.trigger(FIELDS);
  };

  const hasFieldError = FIELDS.some(field => fieldErrors?.[field]);
  const otherServerErrors = Object.entries(fieldErrors ?? {})
    .filter(([key]) => !(FIELDS as readonly string[]).includes(key))
    .map(([key, message]) => `${key}: ${message}`);
  const generalError = hasFieldError
    ? otherServerErrors.join('. ')
    : [errorMessage, ...otherServerErrors].filter(Boolean).join('. ');

  const handleOpenChange = (isOpen: boolean) => {
    if (isPending) return;
    onOpenChange(isOpen);
  };

  const submit = form.handleSubmit(data => {
    if (!isPending) onSubmit(data);
  });

  return (
    <DialogComponent
      open={open}
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
            onChange={val => updateField('price', val)}
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
              updateField('discountPrice', val === '' ? undefined : val)
            }
            error={form.formState.errors.discountPrice?.message}
          />
        </div>
      </form>
    </DialogComponent>
  );
};

export default DiscountFormDialog;
