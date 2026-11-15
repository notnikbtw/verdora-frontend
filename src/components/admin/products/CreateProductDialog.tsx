import React, { useEffect } from 'react';
import DialogComponent from '@components/common/dialog/DialogComponent';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  adminProductSchema,
  type AdminProductFormData,
} from '@/schemas/product.schema';
import type { Category } from '@/types/category';
import ProductFormFields from '@components/admin/products/ProductFormFields';

type CreateProductDialogProps = {
  open: boolean;
  categoriesData?: Category[];
  onSubmit: (data: AdminProductFormData) => void;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
};

export const CreateProductDialog: React.FC<CreateProductDialogProps> = ({
  open,
  categoriesData,
  onSubmit,
  onOpenChange,
  isPending,
}) => {
  const form = useForm<AdminProductFormData>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      discountPrice: undefined,
      categoryId: undefined,
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (!categoriesData?.length) return;

    form.setValue('categoryId', categoriesData[0].categoryId, {
      shouldValidate: true,
    });
  }, [categoriesData, form]);

  const resetForm = () =>
    form.reset({
      name: '',
      description: '',
      price: '',
      discountPrice: undefined,
      categoryId: categoriesData?.[0]?.categoryId,
      imageUrl: '',
    });

  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen);

    if (!isOpen) {
      resetForm();
    }
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <DialogComponent
      open={open}
      onOpenChange={handleClose}
      headerTitle="Create New Product"
      headerDescription="Add a new item to your store product catalog."
      cancelText="Cancel"
      submitText="Create Product"
      onSubmit={form.handleSubmit(data => onSubmit(data))}
      submitDisabled={!form.formState.isValid || isPending}
      autoCloseOnSubmit={false}
      loading={isPending}
    >
      <form onSubmit={form.handleSubmit(data => onSubmit(data))}>
        <ProductFormFields
          form={form}
          categoriesData={categoriesData}
          idPrefix="create"
        />
      </form>
    </DialogComponent>
  );
};

export default CreateProductDialog;
