import React, { useEffect } from 'react';
import DialogComponent from '@components/common/dialog/DialogComponent';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  adminProductSchema,
  type AdminProductFormData,
} from '@/schemas/product.schema';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import ProductFormFields from '@components/admin/products/ProductFormFields';

type EditProductDialogProps = {
  product: Product | null;
  categoriesData?: Category[];
  onSubmit: (data: AdminProductFormData) => void;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
};

export const EditProductDialog: React.FC<EditProductDialogProps> = ({
  product,
  categoriesData,
  onSubmit,
  onOpenChange,
  isPending,
}) => {
  const form = useForm<AdminProductFormData>({
    resolver: zodResolver(adminProductSchema),
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price:
          product.price !== undefined && product.price !== null
            ? String(product.price)
            : '',
        discountPrice:
          product.discountPrice !== undefined && product.discountPrice !== null
            ? String(product.discountPrice)
            : undefined,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
      });
    }
  }, [product, form]);

  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  return (
    <DialogComponent
      open={!!product}
      onOpenChange={handleClose}
      headerTitle="Edit Product"
      headerDescription={`Update product details for #${product?.productId}`}
      cancelText="Cancel"
      submitText="Save Changes"
      onSubmit={form.handleSubmit(data => onSubmit(data))}
      submitDisabled={!form.formState.isValid || isPending}
      autoCloseOnSubmit={false}
      loading={isPending}
    >
      <form onSubmit={form.handleSubmit(data => onSubmit(data))}>
        <ProductFormFields
          form={form}
          categoriesData={categoriesData}
          idPrefix="edit"
        />
      </form>
    </DialogComponent>
  );
};

export default EditProductDialog;
