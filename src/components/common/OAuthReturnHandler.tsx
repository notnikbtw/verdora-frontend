import { useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@api/hooks';
import { fetchMe } from '@api/auth/auth.actions';
import { useGuestCartSyncStatus } from '@hooks/useGuestCartSyncStatus';
import { clearOAuthReturnTo, readOAuthReturnTo } from '@/utils/oauthReturnTo';
import NoticeAlert from '@components/common/NoticeAlert';
import { Button } from '@components/ui/button';
import { Spinner } from '@components/ui/spinner';

const OAuthReturnHandler = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, hydrating } = useAppSelector(state => state.auth);
  const isSyncingCart = useGuestCartSyncStatus();
  const returnTo = readOAuthReturnTo();
  const isReturnPage = pathname === '/' || pathname === '/oauth/callback';

  useEffect(() => {
    if (!isReturnPage || !returnTo || hydrating) return;
    if (!user) {
      if (pathname === '/') clearOAuthReturnTo();
      return;
    }
    if (isSyncingCart) return;
    clearOAuthReturnTo();
    navigate(returnTo, { replace: true });
  }, [
    isReturnPage,
    pathname,
    returnTo,
    user,
    hydrating,
    isSyncingCart,
    navigate,
  ]);

  if (!isReturnPage || !returnTo) return children;
  if (pathname === '/' && !hydrating && !user) return children;

  if (hydrating || isSyncingCart || user) {
    return (
      <div
        role="status"
        className="min-h-svh flex flex-col items-center justify-center gap-3 p-6"
      >
        <Spinner className="size-8 text-primary" />
        <p>
          {isSyncingCart
            ? 'Transferring your cart...'
            : 'Completing sign in...'}
        </p>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <NoticeAlert
        variant="error"
        title="Unable to restore your session"
        message="We couldn't verify your Google sign-in. Retry or return to the login page."
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void dispatch(fetchMe())}>Retry</Button>
            <Button
              variant="outline"
              onClick={() => {
                clearOAuthReturnTo();
                const target = new URL(returnTo, window.location.origin);
                navigate('/login', {
                  replace: true,
                  state: {
                    from: {
                      pathname: target.pathname,
                      search: target.search,
                      hash: target.hash,
                    },
                  },
                });
              }}
            >
              Back to login
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default OAuthReturnHandler;
