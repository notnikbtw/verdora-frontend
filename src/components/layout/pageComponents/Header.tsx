import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Logo from '@components/common/Logo';
import { Button } from '@components/ui/button';
import { useAppSelector } from '@api/hooks';
import { Spinner } from '@components/ui/spinner';
import FavouriteIcon from '@assets/icons/heart.svg?react';
import CartIcon from '@assets/icons/cart.svg?react';
import SearchIcon from '@assets/icons/search.svg?react';
import MenuIcon from '@assets/icons/menu.svg?react';
import { useGetCart } from '@api/cart/cart.hooks';
import LoginPromptDialog from '@components/common/dialog/LoginPromptDialog';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { useLogout } from '@hooks/useLogout';
import LinkComponent from '@components/common/Link';
import { SidebarTrigger } from '@components/ui/sidebar';
import TextField from '@components/common/forms/TextField';

type HeaderProps = {
  onOpenMenu?: () => void;
};

const Header = ({ onOpenMenu }: HeaderProps) => {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const { handleLogout, isLoggingOut } = useLogout();
  const { user, hydrating } = useAppSelector(state => state.auth);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: cart } = useGetCart();
  const items = cart?.items || [];
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
      <header className="sticky top-0 sm:top-6 flex justify-between items-center h-16 px-6 z-50 w-full max-w-6xl mx-auto bg-[#E6EAE5]/80 sm:bg-transparent backdrop-blur border border-white/80 shadow-xs sm:px-8 sm:rounded-full">
        <div className="flex items-center">
          <Logo fontSize="text-2xl" className="text-[#25531F]" />
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-[16px] text-link-text">
          <LinkComponent text="Home" to="/" />
          <LinkComponent text="Catalog" to="/catalog" />
          <LinkComponent text="Sales" to="/catalog?discount=true" />
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
              className="relative flex size-8 items-center justify-center rounded-full hover:bg-zinc-100 transition-colors"
              aria-label="Favourite items"
              onClick={handleFavouriteClick}
            >
              <FavouriteIcon className="size-5 text-[#2C332D]" />
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center justify-center p-2 rounded-full hover:bg-black/5 transition-colors"
              aria-label="Shopping cart"
            >
              <CartIcon className="size-5 text-[#2C332D]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {hydrating ? (
              <Spinner className="h-5 w-5" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile">
                  <div className="flex size-9 items-center justify-center rounded-full bg-accent text-white text-[13px] font-bold">
                    {user.name?.charAt(0).toUpperCase() ?? '?'}
                  </div>
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
