import SidebarHeaderComponent from '@components/layout/pageComponents/sidebar/SidebarHeader';
import SidebarFooterComponent from '@components/layout/pageComponents/sidebar/SidebarFooter';
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupContent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuBadge,
  useSidebar,
} from '@components/ui/sidebar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MAIN_MENU } from '@fixtures/sidebar.fixture';
import { Button } from '@components/ui/button';
import { LogIn } from 'lucide-react';
import TextField from '@components/common/forms/TextField';
import SearchIcon from '@assets/icons/search.svg?react';
import React, { useState } from 'react';
import { useAppSelector } from '@api/hooks';
import { useGetFavorites } from '@api/favorites/favorites.hooks';
import { useGetCart } from '@api/cart/cart.hooks';
import LoginPromptDialog, {
  type AuthPromptAction,
} from '@components/common/dialog/LoginPromptDialog';

type Props = {
  username?: string;
  email?: string;
  loading?: boolean;
};

const MENU_BADGE_TEXT =
  'text-white peer-hover/menu-button:text-white peer-data-active/menu-button:text-white';

const MainSidebar = ({ username, email, loading }: Props) => {
  const menuItems = MAIN_MENU;
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpenMobile, setOpen } = useSidebar();
  const [search, setSearch] = useState('');
  const [loginPromptAction, setLoginPromptAction] =
    useState<AuthPromptAction | null>(null);

  const { user } = useAppSelector(state => state.auth);
  const { data: favorites } = useGetFavorites(Boolean(user));
  const { data: cart } = useGetCart();
  const favoritesCount =
    user && Array.isArray(favorites) ? favorites.length : 0;
  const cartItemCount = (cart?.items ?? []).reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const badges: Record<string, { count: number; color: string }> = {
    '/cart': { count: cartItemCount, color: 'bg-primary' },
    '/favorites': { count: favoritesCount, color: 'bg-favourite' },
  };

  const handleLinkClick = () => {
    setOpenMobile(false);
    setOpen(false);
  };

  // Items that need an account open the same login prompt as the header
  // instead of navigating to a protected route.
  const handleItemClick = (
    item: { authAction?: AuthPromptAction },
    e: React.MouseEvent
  ) => {
    handleLinkClick();
    if (item.authAction && !user) {
      e.preventDefault();
      setLoginPromptAction(item.authAction);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = search.trim();
    if (trimmed) {
      handleLinkClick();
      navigate(`/catalog?search=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <>
      <Sidebar side="right">
        <SidebarHeaderComponent />
        <SidebarContent className="px-2">
          <form onSubmit={handleSearchSubmit} className="p-2">
            <TextField
              type="text"
              placeholder="Search plants"
              rightIcon={<SearchIcon />}
              value={search}
              onChange={val => setSearch(val)}
              onRightIconClick={handleSearchSubmit}
            />
          </form>
          {menuItems.map(section => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map(item => {
                    const isActive =
                      location.pathname === item.path ||
                      (item.path !== '/' &&
                        location.pathname.startsWith(item.path));

                    const badge = badges[item.path];

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className="[--icon-size:1.25rem]"
                          onClick={e => handleItemClick(item, e)}
                        >
                          <Link to={item.path}>
                            {item.icon && (
                              <item.icon className={item.iconClassName} />
                            )}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        {badge && badge.count > 0 && (
                          <SidebarMenuBadge
                            className={`${badge.color} ${MENU_BADGE_TEXT}`}
                          >
                            {badge.count > 99 ? '99+' : badge.count}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        {username ? (
          <SidebarFooterComponent
            username={username}
            email={email || ''}
            loading={loading}
          />
        ) : (
          <div className="p-4 mt-auto">
            <Button asChild className="w-full" onClick={handleLinkClick}>
              <Link to="/login">
                <LogIn className="mr-2 size-4" />
                <span>Log in</span>
              </Link>
            </Button>
          </div>
        )}
      </Sidebar>
      <LoginPromptDialog
        open={loginPromptAction !== null}
        onOpenChange={open => {
          if (!open) setLoginPromptAction(null);
        }}
        action={loginPromptAction ?? 'favorite'}
      />
    </>
  );
};

export default MainSidebar;
