import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@components/ui/dropdown-menu';
import React from 'react';
import { Link } from 'react-router-dom';
import type { UserMenuItems } from '@/types/sidebar';

type DropdownMenuSidebarProps = {
  separator?: boolean;
  items: UserMenuItems[];
  onSelect?: () => void;
};

const DropdownMenuItems: React.FC<DropdownMenuSidebarProps> = ({
  separator = false,
  items,
  onSelect,
}) => {
  return (
    <>
      {items.map(item => (
        <DropdownMenuItem key={item.path} asChild onSelect={onSelect}>
          <Link to={item.path} className="min-h-11 w-full cursor-pointer">
            {item.icon && <item.icon aria-hidden="true" className="size-4" />}
            <span>{item.label}</span>
          </Link>
        </DropdownMenuItem>
      ))}
      {separator && <DropdownMenuSeparator />}
    </>
  );
};

export default DropdownMenuItems;
