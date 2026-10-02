import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '@/schemas/profile.schema';

export const useProfileForm = (defaultValues?: Partial<ProfileFormData>) => {
  return useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      ...defaultValues,
    },
  });
};
