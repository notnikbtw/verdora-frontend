import Header from '@/components/layout/pageComponents/Header';
import Footer from '@/components/layout/pageComponents/Footer';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@api/hooks';
import { fetchMe } from '@api/auth/auth.actions';
import MobileMenu from '@/components/layout/pageComponents/MobileMenu';
import { useGetCart, useSyncCartOnStorage } from '@api/cart/cart.hooks';
import NoticeAlert from '@components/common/NoticeAlert';
import {
  getGuestCartSyncError,
  clearGuestCartSyncError,
} from '@/utils/guestCart';

const LayoutPage = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isCartPage = location.pathname === '/cart';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <div className="flex min-h-screen flex-col bg-[#F5F5DC]">
      <Header onOpenMenu={() => setIsMenuOpen(true)} />
      {isMenuOpen && <MobileMenu onClose={() => setIsMenuOpen(false)} />}
      <main className="flex flex-1 flex-col w-full max-w-427.5 mx-auto px-4">
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
  );
};

export default LayoutPage;
