import type { LucideIcon } from 'lucide-react';
import type { AuthPromptAction } from '@components/common/dialog/LoginPromptDialog';

export type SidebarSection = {
  label: string;
  items: Array<{
    title: string;
    path: string;
    icon: LucideIcon;
    iconClassName?: string;
    authAction?: AuthPromptAction;
  }>;
};

export type UserMenuItems = {
  icon: LucideIcon;
  label: string;
  path: string;
};

export type MenuSection = UserMenuItems[];
