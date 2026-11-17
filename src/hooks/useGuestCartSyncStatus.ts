import { useSyncExternalStore } from 'react';
import { isGuestCartSyncing } from '@/utils/guestCart';

const subscribe = (onChange: () => void) => {
  window.addEventListener('guest-cart-sync-start', onChange);
  window.addEventListener('guest-cart-sync-end', onChange);
  return () => {
    window.removeEventListener('guest-cart-sync-start', onChange);
    window.removeEventListener('guest-cart-sync-end', onChange);
  };
};

export const useGuestCartSyncStatus = () =>
  useSyncExternalStore(subscribe, isGuestCartSyncing, () => false);
