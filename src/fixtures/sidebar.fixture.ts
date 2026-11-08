import type { MenuSection, SidebarSection } from '@/types/sidebar';
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  ShoppingCart,
  Percent,
  FileText,
  Home,
  Heart,
  User,
} from 'lucide-react';

export const ADMIN_MENU: SidebarSection[] = [
  {
    label: 'Dashboard',
    items: [
      { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { title: 'Products', path: '/admin/products', icon: Package },
      { title: 'Categories', path: '/admin/categories', icon: Tag },
      { title: 'Orders', path: '/admin/orders', icon: ShoppingBag },
      { title: 'Discounts', path: '/admin/discounts', icon: Percent },
      { title: 'Reports', path: '/admin/reports', icon: FileText },
    ],
  },
];

export const MAIN_MENU: SidebarSection[] = [
  {
    label: 'Navigation',
    items: [
      { title: 'Home', path: '/', icon: Home },
      { title: 'Catalog', path: '/catalog', icon: Package },
      { title: 'Discounts', path: '/catalog?discount=true', icon: Percent },
    ],
  },
  {
    label: 'Personal',
    items: [
      {
        title: 'Favorites',
        path: '/favorites',
        icon: Heart,
        iconClassName: 'text-red-500',
        authAction: 'favorite',
      },
      { title: 'Shopping Cart', path: '/cart', icon: ShoppingCart },
      {
        title: 'Orders',
        path: '/orders',
        icon: ShoppingBag,
      },
    ],
  },
];

export const USER_MENU: MenuSection = [
  { icon: ShoppingBag, label: 'My Orders', path: '/orders' },
  { icon: User, label: 'Profile', path: '/profile' },
];
