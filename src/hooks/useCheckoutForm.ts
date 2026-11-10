import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useAppSelector } from '@api/hooks';
import { readCheckoutDraft, saveCheckoutDraft } from '@/utils/checkoutDraft';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  checkoutSchema,
  type CheckoutFormData,
} from '@/schemas/checkout.schema';

export const useCheckoutForm = (defaultValues?: Partial<CheckoutFormData>) => {
  const userId = useAppSelector(state => state.auth.user?.id);
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      deliveryMethod: 'delivery',
      pickupLocationId: 'kyiv-1',
      street: '',
      building: '',
      apartment: '',
      ...(userId !== undefined ? readCheckoutDraft(userId) : {}),
      ...defaultValues,
    },
  });
  const { subscribe } = form;
  useEffect(() => {
    return subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        if (userId !== undefined) saveCheckoutDraft(userId, values);
      },
    });
  }, [userId, subscribe]);
  return form;
};
