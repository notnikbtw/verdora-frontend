import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@components/ui/button';
import type { Category } from '@/types/category';
import DialogComponent from '@components/common/dialog/DialogComponent';
import TextField from '@components/common/forms/TextField';
import { useAdminCategoryForm } from '@hooks/useAdminCategoriesForm';
import {
  useUpdateCategory,
  useDeleteCategory,
} from '@api/category/category.hooks';
import AlertComponent from '@components/common/dialog/AlertComponent';

type Props = {
  category: Category;
  categoryMaxLength: number;
};

const CategoryRow = ({ category, categoryMaxLength }: Props) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const {
    handleSubmit: handleEditSubmit,
    formState: { errors: editFormErrors, isValid: isEditValid },
    watch: watchEdit,
    setValue: setEditValue,
    reset: resetEdit,
  } = useAdminCategoryForm();

  const handleOpenEdit = () => {
    updateMutation.reset();
    setEditValue('category', category.name, { shouldValidate: true });
    setEditValue('imageUrl', category.imageUrl ?? '', { shouldValidate: true });
    setIsEditOpen(true);
  };

  const errorUpdate = updateMutation.error?.response?.data?.message;
  const errorDelete = deleteMutation.error?.response?.data?.message;

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3.5">
      <span className="min-w-0 flex-1 truncate font-medium">
        {category.name}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpenEdit}
        aria-label={`Edit ${category.name}`}
      >
        <Pencil aria-hidden="true" />
        <span className="hidden sm:inline">Edit</span>
      </Button>

      <DialogComponent
        open={isEditOpen}
        onOpenChange={open => {
          setIsEditOpen(open);
          if (!open) {
            resetEdit();
            updateMutation.reset();
          }
        }}
        headerTitle="Edit category"
        headerDescription="Update the category name and image."
        cancelText="Cancel"
        submitText="Save changes"
        onSubmit={handleEditSubmit(data =>
          updateMutation.mutate(
            {
              categoryId: category.categoryId,
              name: data.category,
              // PUT replaces the category, so always send the image back.
              imageUrl: data.imageUrl || undefined,
            },
            { onSuccess: () => setIsEditOpen(false) }
          )
        )}
        submitDisabled={!isEditValid || updateMutation.isPending}
        autoCloseOnSubmit={false}
        loading={updateMutation.isPending}
        thirdActionText="Delete"
        onThirdAction={() => {
          deleteMutation.reset();
          setIsDeleteDialogOpen(true);
        }}
        thirdActionDisabled={
          updateMutation.isPending || deleteMutation.isPending
        }
      >
        <div className="space-y-4">
          <TextField
            type="text"
            label="Name"
            id={`edit-category-${category.categoryId}`}
            placeholder="e.g. Garden Shovels"
            value={watchEdit('category')}
            onChange={value =>
              setEditValue('category', value, { shouldValidate: true })
            }
            error={editFormErrors.category?.message}
          />
          <TextField
            type="text"
            label="Image URL (optional)"
            id={`edit-category-image-${category.categoryId}`}
            placeholder="https://example.com/categories/garden.jpg"
            value={watchEdit('imageUrl') ?? ''}
            onChange={value =>
              setEditValue('imageUrl', value, { shouldValidate: true })
            }
            error={editFormErrors.imageUrl?.message}
          />
          {errorUpdate ? (
            <p
              id={`edit-category-name-error-${category.categoryId}`}
              role="alert"
              className="text-sm text-destructive"
            >
              {errorUpdate}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Maximum {categoryMaxLength} characters.
            </p>
          )}
        </div>
      </DialogComponent>

      <AlertComponent
        title="Delete category"
        description={`Are you sure you want to delete category "${category.name}"?`}
        isAlertDialogOpen={isDeleteDialogOpen}
        errorText={errorDelete}
        onOpenChange={open => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            deleteMutation.reset();
          }
        }}
        onAction={() => {
          deleteMutation.mutate(
            { categoryId: category.categoryId },
            {
              onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setIsEditOpen(false);
              },
            }
          );
        }}
        isDeleting={deleteMutation.isPending}
      />
    </li>
  );
};

export default CategoryRow;
