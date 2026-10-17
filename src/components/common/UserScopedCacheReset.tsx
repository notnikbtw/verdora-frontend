import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@api/hooks';

// Favorites are cached without the user in the key, so the previous user's list
// would survive a session that ends without the Log out button (an expired
// token) or a different account signing in. Reset it whenever a signed-in user
// changes or signs out. Renders nothing.
const UserScopedCacheReset = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector(state => state.auth.user?.id ?? null);
  const previousUserId = useRef<number | null>(userId);

  useEffect(() => {
    const previous = previousUserId.current;
    previousUserId.current = userId;

    // Signing in from a guest session has no previous user's data to clear.
    if (previous !== null && previous !== userId) {
      queryClient.resetQueries({ queryKey: ['favorites'] });
    }
  }, [userId, queryClient]);

  return null;
};

export default UserScopedCacheReset;
