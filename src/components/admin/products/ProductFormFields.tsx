import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import TextField from '@components/common/forms/TextField';
import NoticeAlert from '@components/common/NoticeAlert';
import type { AdminProductFormData } from '@/schemas/product.schema';
import type { Category } from '@/types/category';

type ProductFormFieldsProps = {
  form: UseFormReturn<AdminProductFormData>;
  categoriesData?: Category[];
  errorMessage?: string;
  idPrefix?: string;
};

export const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  form,
  categoriesData,
  errorMessage,
  idPrefix = 'product',
}) => {
  return (
    <div className="space-y-4 py-1">
      {errorMessage && <NoticeAlert variant="error" message={errorMessage} />}

      <TextField
        type="text"
        label="Product Name"
        id={`${idPrefix}-name`}
        placeholder="e.g. Premium Organic Fertilizer"
        value={form.watch('name') || ''}
        onChange={val => form.setValue('name', val, { shouldValidate: true })}
        error={form.formState.errors.name?.message}
      />

      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-category`}
          className="text-sm font-medium text-foreground"
        >
          Category
        </label>
        <select
          id={`${idPrefix}-category`}
          value={form.watch('categoryId') ?? ''}
          onChange={e =>
            form.setValue('categoryId', Number(e.target.value), {
              shouldValidate: true,
            })
          }
          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="" disabled>
            Select category
          </option>
          {categoriesData?.map(cat => (
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.name}
            </option>
          ))}
        </select>
        {form.formState.errors.categoryId && (
          <p className="text-xs text-destructive">
            {form.formState.errors.categoryId.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          type="number"
          label="Price (₴)"
          id={`${idPrefix}-price`}
          placeholder="29.99"
          value={form.watch('price') || ''}
          onChange={val =>
            form.setValue('price', val, { shouldValidate: true })
          }
          error={form.formState.errors.price?.message}
        />

        <TextField
          type="number"
          label="Discount Price (₴)"
          id={`${idPrefix}-discount`}
          placeholder="19.99 (Optional)"
          value={form.watch('discountPrice') || ''}
          onChange={val =>
            form.setValue('discountPrice', val === '' ? undefined : val, {
              shouldValidate: true,
            })
          }
          error={form.formState.errors.discountPrice?.message}
        />
      </div>

      <TextField
        type="text"
        label="Image URL"
        id={`${idPrefix}-image`}
        placeholder="https://example.com/image.jpg"
        value={form.watch('imageUrl') || ''}
        onChange={val =>
          form.setValue('imageUrl', val, { shouldValidate: true })
        }
        error={form.formState.errors.imageUrl?.message}
      />

      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-description`}
          className="text-sm font-medium text-foreground"
        >
          Description
        </label>
        <textarea
          id={`${idPrefix}-description`}
          rows={3}
          placeholder="Detailed description of the product..."
          value={form.watch('description') || ''}
          onChange={e =>
            form.setValue('description', e.target.value, {
              shouldValidate: true,
            })
          }
          className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {form.formState.errors.description && (
          <p className="text-xs text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductFormFields;
