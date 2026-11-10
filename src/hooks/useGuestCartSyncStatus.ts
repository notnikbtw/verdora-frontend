import { useEffect, useState } from 'react';
import { isGuestCartSyncing } from '@/utils/guestCart';

export const useGuestCartSyncStatus = () => {
  const [syncing, setSyncing] = useState(isGuestCartSyncing);
  useEffect(() => {
    const start = () => setSyncing(true);
    const finish = () => setSyncing(false);
    window.addEventListener('guest-cart-sync-start', start);
    window.addEventListener('guest-cart-sync-end', finish);
    return () => {
      window.removeEventListener('guest-cart-sync-start', start);
      window.removeEventListener('guest-cart-sync-end', finish);
    };
  }, []);
  return syncing;
};
