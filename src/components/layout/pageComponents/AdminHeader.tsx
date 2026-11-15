import { SidebarTrigger } from '@components/ui/sidebar';
import Breadcrumbs from '@components/common/Breadcrumbs';

const AdminHeader = () => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 w-full mb-4 bg-background/50 backdrop-blur-md px-4 border border-border shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2" />
        <Breadcrumbs root={{ label: 'Admin', href: '/admin' }} />
      </div>
    </header>
  );
};

export default AdminHeader;
