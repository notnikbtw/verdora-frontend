import { TabsList, TabsTrigger } from '@components/ui/tabs';
import { User, ShoppingBag, ShoppingCart, Settings } from 'lucide-react';
import { useGetCart } from '@api/cart/cart.hooks';
import { cn } from '@/lib/utils';

export const ProfileNavSidebar = () => {
  const { data: cart } = useGetCart();
  const cartItemsCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const triggerClasses = cn(
    'flex items-center gap-3 w-auto md:w-full h-12 px-4 rounded-[14px] text-[15px] tracking-[-0.05em] font-medium transition-colors justify-start cursor-pointer border-0 shadow-none shrink-0 whitespace-nowrap after:hidden',
    'text-[#586455] hover:bg-[#F4F6F3] hover:text-[#0C0C0C]',
    'data-[state=active]:bg-[#EDF5E9] data-[state=active]:text-[#2F6B29] data-[state=active]:font-semibold'
  );

  return (
    <aside className="w-full md:w-60 lg:w-64 shrink-0 md:sticky md:top-24">
      <TabsList className="w-full h-auto p-0 bg-transparent border-0 shadow-none flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden justify-start">
        <TabsTrigger value="profile" className={triggerClasses}>
          <User className="size-5 shrink-0 stroke-[1.6]" />
          <span>Profile</span>
        </TabsTrigger>

        <TabsTrigger value="orders" className={triggerClasses}>
          <ShoppingBag className="size-5 shrink-0 stroke-[1.6]" />
          <span>Orders</span>
        </TabsTrigger>

        <TabsTrigger value="cart" className={triggerClasses}>
          <ShoppingCart className="size-5 shrink-0 stroke-[1.6]" />
          <span>Cart</span>
          {cartItemsCount > 0 && (
            <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-semibold bg-[#2F6B29]/10 text-[#2F6B29] group-data-[state=active]/tabs-trigger:bg-[#2F6B29] group-data-[state=active]/tabs-trigger:text-white">
              {cartItemsCount}
            </span>
          )}
        </TabsTrigger>

        <TabsTrigger value="settings" className={triggerClasses}>
          <Settings className="size-5 shrink-0 stroke-[1.6]" />
          <span>Settings</span>
        </TabsTrigger>
      </TabsList>
    </aside>
  );
};

export default ProfileNavSidebar;
