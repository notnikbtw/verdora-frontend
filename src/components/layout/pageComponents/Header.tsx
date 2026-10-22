import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import Logo from '@components/common/Logo';
import { Button } from '@components/ui/button';
import { useAppSelector } from '@api/hooks';
import { Spinner } from '@components/ui/spinner';
import CartIcon from '@assets/icons/cart.svg?react';
import SearchIcon from '@assets/icons/search.svg?react';
import MenuIcon from '@assets/icons/menu.svg?react';
import { useGetCart } from '@api/cart/cart.hooks';
import { useGetFavorites } from '@api/favorites/favorites.hooks';
import LoginPromptDialog from '@components/common/dialog/LoginPromptDialog';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { useLogout } from '@hooks/useLogout';
import LinkComponent from '@components/common/Link';
import { SidebarTrigger } from '@components/ui/sidebar';
import TextField from '@components/common/forms/TextField';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart } from 'lucide-react';

type HeaderProps = {
  onOpenMenu?: () => void;
};

const Header = ({ onOpenMenu }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = useNetworkStatus();
  const { handleLogout, isLoggingOut } = useLogout();
  const { user, hydrating } = useAppSelector(state => state.auth);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  const isSalesPage =
    location.pathname.includes('/sales') ||
    (location.pathname === '/catalog' &&
      (new URLSearchParams(location.search).get('discount') === 'true' ||
        new URLSearchParams(location.search).get('onSale') === 'true'));
  const isSalesActive = isSalesPage;
  const isCatalogActive = location.pathname === '/catalog' && !isSalesPage;
  const [search, setSearch] = useState('');

  const { data: cart } = useGetCart();
  const items = cart?.items || [];
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const { data: favorites } = useGetFavorites(Boolean(user));
  const favoritesCount =
    user && Array.isArray(favorites) ? favorites.length : 0;

  const handleFavouriteClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setIsLoginPromptOpen(true);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const trimmed = search.trim();
    if (trimmed) {
      navigate(`/catalog?search=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 sm:top-6 flex justify-between items-center h-16 px-6 z-50 w-full sm:page-container bg-[#E6EAE5]/80 sm:bg-transparent backdrop-blur border border-white/80 shadow-xs sm:px-8 sm:rounded-full">
        <div className="flex items-center">
          <Logo fontSize="text-2xl" className="text-[#25531F]" />
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-[16px] text-link-text">
          <LinkComponent text="Home" to="/" />
          <LinkComponent
            text="Catalog"
            to="/catalog"
            isActive={isCatalogActive}
          />
          <LinkComponent
            text="Sales"
            to="/catalog?discount=true"
            isActive={isSalesActive}
          />
        </nav>

        <div className="hidden lg:flex items-center gap-6">
          <form onSubmit={handleSearchSubmit} className="flex">
            <TextField
              type="text"
              placeholder="Search plants"
              rightIcon={<SearchIcon />}
              value={search}
              onChange={val => setSearch(val)}
              onRightIconClick={handleSearchSubmit}
              containerClassName="!rounded-full !bg-white border-0 shadow-2xs"
            />
          </form>

          <div className="flex items-center gap-3">
            <Link
              to="/favorites"
              className="relative flex items-center justify-center p-2 rounded-full hover:bg-favourite-soft transition-colors"
              aria-label={
                favoritesCount > 0
                  ? `Favourite items (${favoritesCount})`
                  : 'Favourite items'
              }
              onClick={handleFavouriteClick}
            >
              <Heart
                className={`size-5 transition-colors ${
                  favoritesCount > 0
                    ? 'text-favourite [&_path]:fill-current'
                    : 'text-[#2C332D] [&_path]:fill-none'
                }`}
              />
              {favoritesCount > 0 && (
                <span className="count-badge bg-favourite">
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center justify-center p-2 rounded-full hover:bg-black/5 transition-colors"
              aria-label="Shopping cart"
            >
              <CartIcon className="size-5 text-[#2C332D]" />
              {cartItemCount > 0 && (
                <span className="count-badge bg-primary">{cartItemCount}</span>
              )}
            </Link>

            {hydrating ? (
              <Spinner className="h-5 w-5" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile">
                  <Avatar className="w-10 h-10 border-2 border-primary hover:border-primary-hover">
                    <AvatarFallback className="bg-[#d3f2d1] text-primary">
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button
                  variant="default"
                  onClick={handleLogout}
                  disabled={!isOnline || isLoggingOut}
                  title={!isOnline ? 'Cannot log out while offline' : undefined}
                >
                  {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                </Button>
              </div>
            ) : (
              <Button variant="default" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="flex lg:hidden items-center">
          {onOpenMenu ? (
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Open mobile menu"
              className="p-1"
            >
              <MenuIcon className="size-6 text-link-text" />
            </button>
          ) : (
            <SidebarTrigger>
              <MenuIcon className="size-6 text-link-text" />
            </SidebarTrigger>
          )}
        </div>
      </header>

      <LoginPromptDialog
        open={isLoginPromptOpen}
        onOpenChange={setIsLoginPromptOpen}
        action="favorite"
      />
    </>
  );
};

export default Header;
