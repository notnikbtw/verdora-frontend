import { useState, useMemo } from 'react';
import { useIsMobile } from '@hooks/use-mobile';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import Breadcrumbs from '@components/common/Breadcrumbs';
import ErrorSection from '@components/common/section/ErrorSection';
import { Tabs, TabsContent } from '@components/ui/tabs';
import { ProfileNavSidebar } from '@components/profile/ProfileNavSidebar';
import { ProfileViewCard } from '@components/profile/ProfileViewCard';
import { ProfileEditCard } from '@components/profile/ProfileEditCard';
import { ProfileOrdersTab } from '@components/profile/ProfileOrdersTab';
import { ProfileCartTab } from '@components/profile/ProfileCartTab';
import { ProfileSettingsTab } from '@components/profile/ProfileSettingsTab';
import { DeleteAccountModal } from '@components/profile/DeleteAccountModal';
import { ProfileSkeleton } from '@components/profile/ProfileSkeleton';
import {
  useGetCurrentUser,
  useUpdateUserProfile,
  useDeleteUser,
} from '@api/user/user.hooks';
import type { ProfileFormData } from '@/schemas/profile.schema';
import { useAppDispatch } from '@api/hooks';
import { updateUser, clearAuth } from '@api/auth/auth.slice';
import { useQueryClient } from '@tanstack/react-query';
import { clearGuestCart } from '@/utils/guestCart';
import { clearCheckoutDraft } from '@/utils/checkoutDraft';
import { clearOAuthReturnTo } from '@/utils/oauthReturnTo';

export const Profile = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const currentTab = searchParams.get('tab') || 'profile';
  const validTabs = ['profile', 'orders', 'cart', 'settings'];
  const activeTab = validTabs.includes(currentTab) ? currentTab : 'profile';

  const handleTabChange = (nextTab: string) => {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        if (nextTab === 'profile') {
          next.delete('tab');
        } else {
          next.set('tab', nextTab);
        }
        return next;
      },
      { replace: true }
    );
  };

  const breadcrumbsItems = useMemo(() => {
    const items: Array<{ label: string; href?: string }> = [
      { label: 'Home', href: '/' },
    ];
    if (activeTab === 'orders') {
      items.push({ label: 'My profile', href: '/profile' });
      items.push({ label: 'Orders' });
    } else if (activeTab === 'cart') {
      items.push({ label: 'My profile', href: '/profile' });
      items.push({ label: 'Cart' });
    } else if (activeTab === 'settings') {
      items.push({ label: 'My profile', href: '/profile' });
      items.push({ label: 'Settings' });
    } else {
      items.push({ label: 'My profile' });
    }
    return items;
  }, [activeTab]);

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCurrentUser();

  const updateMutation = useUpdateUserProfile();
  const deleteMutation = useDeleteUser();

  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSaveProfile = async (formData: ProfileFormData) => {
    if (!user || updateMutation.isPending) return;

    try {
      const updated = await updateMutation.mutateAsync({
        name: formData.name,
        ...(formData.phone ? { phone: formData.phone } : {}),
      });

      dispatch(updateUser({ ...user, ...updated }));
      toast.success('Profile updated successfully');
      setMode('view');
    } catch {
      // MutationCache.onError displays the error toast; keep the form editable.
    }
  };

  const handleDeleteAccount = async (password: string) => {
    if (!user || deleteMutation.isPending) return;

    try {
      await deleteMutation.mutateAsync({
        password,
      });

      clearGuestCart();
      if (user.id !== undefined) clearCheckoutDraft(user.id);
      clearOAuthReturnTo();
      dispatch(clearAuth());
      queryClient.clear();
      setIsDeleteModalOpen(false);
      navigate('/', { replace: true });
      toast.success('Your account has been deleted');
    } catch {
      // MutationCache.onError displays the error toast; keep the dialog open.
    }
  };

  return (
    <LayoutPage>
      <div className="page-stack sm:py-8">
        <Breadcrumbs items={breadcrumbsItems} />

        {isLoading ? (
          <ProfileSkeleton />
        ) : isError || !user ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xs">
            <ErrorSection
              title="We couldn’t load your profile"
              message={
                error?.response?.data?.message ||
                error?.message ||
                'The request to fetch your profile data failed. Please try again.'
              }
              onRetry={() => refetch()}
              retryText="Try again"
            />
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            orientation={isMobile ? 'horizontal' : 'vertical'}
            className="w-full gap-0"
          >
            <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-start w-full">
              <ProfileNavSidebar />

              <div className="flex-1 min-w-0 w-full">
                <TabsContent value="profile" className="mt-0 outline-none">
                  {mode === 'view' ? (
                    <ProfileViewCard
                      user={user}
                      onStartEdit={() => setMode('edit')}
                    />
                  ) : (
                    <ProfileEditCard
                      user={user}
                      onCancel={() => setMode('view')}
                      onSubmit={handleSaveProfile}
                      isPending={updateMutation.isPending}
                    />
                  )}
                </TabsContent>

                <TabsContent value="orders" className="mt-0 outline-none">
                  <ProfileOrdersTab />
                </TabsContent>

                <TabsContent value="cart" className="mt-0 outline-none">
                  <ProfileCartTab />
                </TabsContent>

                <TabsContent value="settings" className="mt-0 outline-none">
                  <ProfileSettingsTab
                    user={user}
                    onOpenDelete={() => setIsDeleteModalOpen(true)}
                  />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        )}

        <DeleteAccountModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirmDelete={handleDeleteAccount}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </LayoutPage>
  );
};

export default Profile;
