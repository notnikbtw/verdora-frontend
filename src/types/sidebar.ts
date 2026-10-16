import type { LucideIcon } from 'lucide-react';

export type SidebarSection = {
  label: string;
  items: Array<{
    title: string;
    path: string;
    icon: LucideIcon;
    iconClassName?: string;
  }>;
};

export type UserMenuItems = {
  icon: LucideIcon;
  label: string;
  path: string;
};

export type MenuSection = UserMenuItems[];
