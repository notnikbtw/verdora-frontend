import AdminLayout from '@components/layout/pageLayout/AdminLayout';
import AdminSectionHeader from '@components/common/section/AdminSectionHeader';
import { Button } from '@components/ui/button';
import { FolderOpen, Plus, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import ErrorSection from '@components/common/section/ErrorSection';
import { EmptySection } from '@components/common/section/EmptySection';
import CategoryRow from '@components/common/cards/CategoryRow';
import DialogComponent from '@components/common/dialog/DialogComponent';
import TextField from '@components/common/forms/TextField';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { Skeleton } from '@components/ui/skeleton';
import { PaginationComponent } from '@components/common/pagination/Pagination';
import { scrollToTop } from '@/utils/scroll.utils';
import {
  useAdminCategoryForm,
  type AdminCategotyFormData,
} from '@hooks/useAdminCategoriesForm';
import { rateLimit } from '@/utils/rateLimit';
import {
  useGetCategories,
  useCreateCategory,
} from '@api/category/category.hooks';

const PAGE_SIZE = 12;

const AdminCategoriesPage = () => {
  const categoryMaxLength = 50;
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('id,asc');
  const {
    data: categoriesPage,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCategories({ page, size: PAGE_SIZE, sort });
  const items = categoriesPage?.content ?? [];
  const handlePageChange = (nextPage: number) => {
    scrollToTop();
    setPage(nextPage);
  };
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
          setPage(0);
        },
      }
    );
  };

  const errorCreate = createMutation.error?.response?.data?.message;

  return (
    <AdminLayout>
      <AdminSectionHeader
        title="Categories"
        count={categoriesPage?.totalElements}
        description="Manage how products are organized in your catalog."
      >
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw
              aria-hidden="true"
              className={`size-4 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
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
        </div>
      </AdminSectionHeader>

      <Card className="mt-6 border-border shadow-sm">
        <CardHeader className="py-4 px-6 border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Category Records</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {isLoading
                  ? 'Loading categories...'
                  : error
                    ? 'Unable to load categories'
                    : `Displaying page ${page + 1} of ${Math.max(1, categoriesPage?.totalPages ?? 0)} (${items.length} of ${categoriesPage?.totalElements ?? 0} items)`}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="category-sort" className="text-sm font-medium">
                Sort by
              </label>
              <select
                id="category-sort"
                value={sort}
                onChange={event => {
                  setSort(event.target.value);
                  setPage(0);
                }}
                className="min-h-11 rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm"
              >
                <option value="id,asc">ID: Low to High</option>
                <option value="id,desc">ID: High to Low</option>
                <option value="name,asc">Name: A–Z</option>
                <option value="name,desc">Name: Z–A</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto" aria-busy={isFetching}>
          {error ? (
            <div className="p-6">
              <ErrorSection
                title="Unable to load categories"
                message={
                  error.response?.data?.message ||
                  error.message ||
                  'Failed to load categories.'
                }
                onRetry={() => void refetch()}
              />
            </div>
          ) : !isLoading && items.length === 0 ? (
            <EmptySection
              title="No categories yet"
              description="Create your first category to start organizing products."
              className="px-6 py-12"
              icon={
                <FolderOpen
                  className="size-8 text-primary"
                  aria-hidden="true"
                />
              }
              action={
                <Button
                  onClick={() => {
                    createMutation.reset();
                    setIsCreateOpen(true);
                  }}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Create category
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Category</TableHead>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-11 rounded-md" />
                            <Skeleton className="h-5 w-40" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-12" />
                        </TableCell>
                        <TableCell className="pr-6">
                          <Skeleton className="ml-auto h-8 w-40" />
                        </TableCell>
                      </TableRow>
                    ))
                  : items.map(category => (
                      <CategoryRow
                        key={category.categoryId}
                        category={category}
                        categoryMaxLength={categoryMaxLength}
                        onDeleted={() => {
                          if (items.length === 1 && page > 0) setPage(page - 1);
                        }}
                      />
                    ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {!error && categoriesPage && categoriesPage.totalPages > 1 && (
          <div className="p-4 border-t border-border">
            <PaginationComponent
              currentPage={page}
              totalPages={categoriesPage.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>

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
