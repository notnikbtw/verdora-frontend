import { MutationCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/error.utils';

// Every failed mutation (a user action) gets an error notification here.
// Queries are not included: they already render their own error states.
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: error => {
      const message = getApiErrorMessage(error);
      // Same message while the first toast is open: show it once.
      toast.error(message, { toastId: message });
    },
  }),
});
