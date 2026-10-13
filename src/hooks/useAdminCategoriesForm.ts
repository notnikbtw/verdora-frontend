import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminCategorySchema } from '@/schemas/category.schema';
import { z } from 'zod';

export type AdminCategotyFormData = z.infer<typeof adminCategorySchema>;

export const useAdminCategoryForm = () => {
  return useForm<AdminCategotyFormData>({
    resolver: zodResolver(adminCategorySchema),
    mode: 'onChange',
    defaultValues: {
      category: '',
      imageUrl: '',
    },
  });
};
