import AdminLayout from '@components/layout/pageLayout/AdminLayout';
import AdminSectionHeader from '@components/common/section/AdminSectionHeader';
import { Button } from '@components/ui/button';
import { FolderOpen, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import ErrorSection from '@components/common/section/ErrorSection';
import { EmptySection } from '@components/common/section/EmptySection';
import CategoryRow from '@components/common/cards/CategoryRow';
import DialogComponent from '@components/common/dialog/DialogComponent';
import TextField from '@components/common/forms/TextField';
import CategoryListSkeleton from '@components/common/cards/CategoryListSkeleton';
import {
  useAdminCategoryForm,
  type AdminCategotyFormData,
} from '@hooks/useAdminCategoriesForm';
import { rateLimit } from '@/utils/rateLimit';
import {
  useAllCategories,
  useCreateCategory,
} from '@api/category/category.hooks';

const AdminCategoriesPage = () => {
  const categoryMaxLength = 50;
  const { data: items, isLoading, error, refetch } = useAllCategories();
  const createMutation = useCreateCategory();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    handleSubmit: handleCreateSubmit,
    formState: { errors: createFormErrors, isValid: isCreateValid },
    watch: watchCreate,
    setValue: setCreateValue,
    reset: resetCreate,
  } = useAdminCategoryForm();

  const canSubmit = useMemo(() => rateLimit(2000), []);

  const handleCreate = (data: AdminCategotyFormData) => {
    if (!canSubmit()) return;

    createMutation.mutate(
      { name: data.category, imageUrl: data.imageUrl || undefined },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          resetCreate();
        },
      }
    );
  };

  const errorCreate = createMutation.error?.response?.data?.message;

  return (
    <AdminLayout>
      <AdminSectionHeader
        title="Categories"
        count={items ? items.length : 0}
        description="Manage how products are organized in your catalog."
      >
        <Button
          onClick={() => {
            createMutation.reset();
            setIsCreateOpen(true);
          }}
          className="w-full sm:w-auto cursor-pointer"
        >
          <Plus aria-hidden="true" />
          Create category
        </Button>
      </AdminSectionHeader>

      <div className="mt-8">
        {isLoading ? (
          <CategoryListSkeleton />
        ) : error ? (
          <ErrorSection
            title={'Something went wrong'}
            message={error?.response?.data?.message || 'Failed to load'}
            onRetry={() => refetch()}
          />
        ) : !Array.isArray(items) || items.length === 0 ? (
          <EmptySection
            title="No categories yet"
            description="Create your first category to start organizing products."
            className="rounded-xl border border-dashed border-border bg-card px-6 py-3"
            icon={
              <div className="flex items-center justify-center rounded-full bg-primary/10 p-4">
                <FolderOpen
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
              </div>
            }
            action={
              <Button
                onClick={() => {
                  createMutation.reset();
                  setIsCreateOpen(true);
                }}
                className="cursor-pointer"
              >
                <Plus className="size-4" aria-hidden="true" />
                Create category
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {items.map(category => (
              <CategoryRow
                key={category.categoryId}
                category={category}
                categoryMaxLength={categoryMaxLength}
              />
            ))}
          </ul>
        )}
      </div>

      <DialogComponent
        open={isCreateOpen}
        onOpenChange={open => {
          setIsCreateOpen(open);
          if (!open) {
            resetCreate();
            createMutation.reset();
          }
        }}
        headerTitle="Create category"
        headerDescription="Add a new category to organize your products."
        cancelText="Cancel"
        submitText="Create"
        onSubmit={handleCreateSubmit(handleCreate)}
        submitDisabled={!isCreateValid || createMutation.isPending}
        autoCloseOnSubmit={false}
        loading={createMutation.isPending}
      >
        <div className="space-y-4">
          <TextField
            type="text"
            label="Name"
            id="category"
            placeholder="e.g. Garden Shovels"
            value={watchCreate('category')}
            onChange={value =>
              setCreateValue('category', value, { shouldValidate: true })
            }
            error={createFormErrors.category?.message}
          />
          <TextField
            type="text"
            label="Image URL (optional)"
            id="category-image-url"
            placeholder="https://example.com/categories/garden.jpg"
            value={watchCreate('imageUrl') ?? ''}
            onChange={value =>
              setCreateValue('imageUrl', value, { shouldValidate: true })
            }
            error={createFormErrors.imageUrl?.message}
          />
          {errorCreate ? (
            <p
              id="category-name-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errorCreate}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Maximum {categoryMaxLength} characters.
            </p>
          )}
        </div>
      </DialogComponent>
    </AdminLayout>
  );
};

export default AdminCategoriesPage;
