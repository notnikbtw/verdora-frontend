import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@components/ui/sidebar';
import { ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import UserDropdownMenu from '@components/common/dropdown/UserDropdownMenu';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  username: string;
  email: string;
  loading?: boolean;
};

const SidebarFooterComponent = ({ username, email, loading }: Props) => {
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          {loading ? (
            <div className="flex items-center justify-center w-full">
              <div className="flex items-center gap-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-3 w-32 rounded-md" />
                </div>
                <Skeleton className="ml-auto size-4" />
              </div>
            </div>
          ) : (
            <UserDropdownMenu username={username} email={email}>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{username}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                </div>
                <ChevronUp className="ml-auto size-4" />
              </SidebarMenuButton>
            </UserDropdownMenu>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default SidebarFooterComponent;
