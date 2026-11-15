import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { LogOut } from 'lucide-react';
import DropdownMenuItems from '@/components/common/dropdown/DropdownMenuItem';
import { USER_MENU } from '@fixtures/sidebar.fixture';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { useLogout } from '@hooks/useLogout';
import { Skeleton } from '@components/ui/skeleton';
import { SidebarMenuButton, useSidebar } from '@components/ui/sidebar';
import type React from 'react';

type UserFooterProps = {
  avatar?: string;
  username?: string;
  email?: string;
  loading?: boolean;
  children?: React.ReactNode;
};

const UserDropdownMenu = ({
  avatar,
  username,
  email,
  loading = false,
  children,
}: UserFooterProps) => {
  const { isOnline } = useNetworkStatus();
  const { isMobile, setOpenMobile } = useSidebar();
  const { handleLogout, isLoggingOut } = useLogout();

  if (loading) {
    return (
      <SidebarMenuButton size="lg">
        <UserDropdownMenuSkeleton />
      </SidebarMenuButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ? (
          children
        ) : (
          <Avatar>
            <AvatarImage src={avatar} alt="User avatar" />
            <AvatarFallback>
              <Skeleton className="w-full h-full rounded-full" />
            </AvatarFallback>
          </Avatar>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) max-w-[calc(100vw-2rem)] rounded-2xl"
        side={isMobile ? 'top' : 'right'}
        align={isMobile ? 'start' : 'end'}
        sideOffset={8}
        collisionPadding={16}
      >
        {!isMobile && (
          <DropdownMenuLabel>
            <div className="flex items-center gap-2 ">
              <Avatar>
                <AvatarFallback>
                  {username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-sm leading-tight">
                <span className="truncate font-semibold">{username}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        )}
        {!isMobile && <DropdownMenuSeparator />}
        <DropdownMenuItems
          items={USER_MENU}
          onSelect={() => {
            if (isMobile) setOpenMobile(false);
          }}
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="min-h-11 cursor-pointer"
          onSelect={event => {
            event.preventDefault();
            void handleLogout();
          }}
          disabled={!isOnline || isLoggingOut}
        >
          <LogOut aria-hidden="true" className="size-4" />
          {isLoggingOut
            ? 'Logging out...'
            : !isOnline
              ? 'Logout (offline)'
              : 'Logout'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const UserDropdownMenuSkeleton = () => {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
};

export default UserDropdownMenu;
