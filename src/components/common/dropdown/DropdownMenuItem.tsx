import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@radix-ui/react-dropdown-menu';
import React from 'react';
import { Link } from 'react-router';
import type { UserMenuItems } from '@/types/sidebar';

type DropdownMenuSidebarProps = {
  separator?: boolean;
  items: UserMenuItems[];
};

const DropdownMenuItems: React.FC<DropdownMenuSidebarProps> = ({
  separator = false,
  items,
}) => {
  return (
    <>
      {items.map(item => (
        <DropdownMenuItem key={item.path} asChild>
          <Link
            to={item.path}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {item.icon && <item.icon />}
            <span>{item.label}</span>
          </Link>
        </DropdownMenuItem>
      ))}
      {separator && <DropdownMenuSeparator />}
    </>
  );
};

export default DropdownMenuItems;
