import Header from '@components/layout/pageComponents/Header';
import Footer from '@components/layout/pageComponents/Footer';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@api/hooks';
import { fetchMe } from '@api/auth/auth.actions';
import { useGetCart, useSyncCartOnStorage } from '@api/cart/cart.hooks';
import NoticeAlert from '@components/common/NoticeAlert';
import {
  getGuestCartSyncError,
  clearGuestCartSyncError,
} from '@/utils/guestCart';
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar';
import MainSidebar from '@components/layout/pageComponents/sidebar/MainSidebar';
import { PAGE_CONTENT_WIDTH_CLASS } from '@/lib/layout';

const LayoutPage = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isCartPage = location.pathname === '/cart';
  const { user, initialized, hydrating } = useAppSelector(state => state.auth);
  const [syncError, setSyncError] = useState<string | null>(() =>
    getGuestCartSyncError()
  );

  useSyncCartOnStorage();

  useGetCart({
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (!initialized && !hydrating) {
      dispatch(fetchMe());
    }
  }, [dispatch, initialized, hydrating]);

  useEffect(() => {
    const handleSyncError = () => {
      setSyncError(getGuestCartSyncError());
    };
    window.addEventListener('guest-cart-sync-error', handleSyncError);
    return () => {
      window.removeEventListener('guest-cart-sync-error', handleSyncError);
    };
  }, []);

  const handleDismissSyncError = () => {
    clearGuestCartSyncError();
    setSyncError(null);
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <SidebarInset className="bg-transparent">
        <div className="relative flex min-h-screen flex-col bg-[#E6EAE5]">
          <div
            className="fixed inset-0 pointer-events-none z-0 opacity-10 mix-blend-multiply bg-repeat"
            style={{
              backgroundImage: `url(${import.meta.env.BASE_URL}noise.svg)`,
            }}
          />

          <div className="relative z-10 flex min-h-screen flex-col flex-1">
            <Header />
            <main
              className={`flex flex-1 flex-col ${PAGE_CONTENT_WIDTH_CLASS}`}
            >
              {syncError && !isCartPage && (
                <div className="pt-4">
                  <NoticeAlert
                    variant="error"
                    message={syncError}
                    onDismiss={handleDismissSyncError}
                  />
                </div>
              )}
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </SidebarInset>
      <MainSidebar
        username={user?.name}
        email={user?.email}
        loading={hydrating}
      />
    </SidebarProvider>
  );
};

export default LayoutPage;
