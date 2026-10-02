import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import Breadcrumbs from '@components/common/Breadcrumbs';
import NoticeAlert from '@components/common/NoticeAlert';
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

export const Profile = () => {
  const navigate = useNavigate();
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
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const handleSaveProfile = async (formData: ProfileFormData) => {
    if (!user) return;
    setUpdateError(null);

    try {
      const updated = await updateMutation.mutateAsync({
        id: user.id,
        payload: {
          name: formData.name,
          phone: formData.phone,
        },
      });

      dispatch(updateUser(updated));
      setSuccessToast('Profile updated successfully');
      setMode('view');
    } catch (err: unknown) {
      const apiErr = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        apiErr?.response?.data?.message ||
        apiErr?.message ||
        'Failed to save profile changes. Please try again.';
      setUpdateError(msg);
    }
  };

  const handleDeleteAccount = async (password: string) => {
    if (!user) return;
    setDeleteError(null);

    try {
      await deleteMutation.mutateAsync({
        id: user.id,
        data: { password },
      });

      dispatch(clearAuth());
      queryClient.clear();
      setIsDeleteModalOpen(false);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const apiErr = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        apiErr?.response?.data?.message ||
        apiErr?.message ||
        'Failed to delete account. Please verify your password.';
      setDeleteError(msg);
    }
  };

  return (
    <LayoutPage>
      <div className="w-full py-6 sm:py-8 space-y-6">
        <Breadcrumbs items={breadcrumbsItems} />

        {successToast && (
          <NoticeAlert
            variant="success"
            message={successToast}
            onDismiss={() => setSuccessToast(null)}
          />
        )}

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
            orientation="vertical"
            className="w-full gap-0"
          >
            <div className="flex flex-col md:flex-row gap-8 items-start w-full">
              <ProfileNavSidebar />

              <div className="flex-1 min-w-0 w-full">
                <TabsContent value="profile" className="mt-0 outline-none">
                  {mode === 'view' ? (
                    <ProfileViewCard
                      user={user}
                      onStartEdit={() => {
                        setUpdateError(null);
                        setMode('edit');
                      }}
                      onOpenDelete={() => {
                        setDeleteError(null);
                        setIsDeleteModalOpen(true);
                      }}
                    />
                  ) : (
                    <ProfileEditCard
                      user={user}
                      onCancel={() => {
                        setUpdateError(null);
                        setMode('view');
                      }}
                      onSubmit={handleSaveProfile}
                      isPending={updateMutation.isPending}
                      isSuccess={updateMutation.isSuccess}
                      errorText={updateError}
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
                    onOpenDelete={() => {
                      setDeleteError(null);
                      setIsDeleteModalOpen(true);
                    }}
                  />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        )}

        <DeleteAccountModal
          open={isDeleteModalOpen}
          onOpenChange={open => {
            if (!open) setDeleteError(null);
            setIsDeleteModalOpen(open);
          }}
          onConfirmDelete={handleDeleteAccount}
          isDeleting={deleteMutation.isPending}
          errorText={deleteError}
        />
      </div>
    </LayoutPage>
  );
};

export default Profile;
