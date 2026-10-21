import { SidebarInset, SidebarProvider } from '@components/ui/sidebar';
import AdminSidebar from '@components/layout/pageComponents/sidebar/AdminSidebar';
import AdminHeader from '@components/layout/pageComponents/AdminHeader';
import AdminFooter from '@components/layout/pageComponents/AdminFooter';
import { useGetCurrentUser } from '@api/user/user.hooks';
import NoiseBackground from '@components/layout/pageComponents/NoiseBackground';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isPending: userPending } = useGetCurrentUser();

  return (
    <SidebarProvider>
      <AdminSidebar
        username={user?.name || 'Guest'}
        email={user?.email || 'email@example.com'}
        loading={userPending}
      />
      <SidebarInset>
        <div className="relative flex min-h-screen flex-col page-background">
          <NoiseBackground />
          <div className="relative z-10 flex min-h-screen flex-col flex-1">
            <AdminHeader />
            <div className="flex flex-1 flex-col gap-6 w-full max-w-427.5 mx-auto px-4 py-2 animate-in fade-in-0 duration-500">
              {children}
            </div>
            <AdminFooter />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
