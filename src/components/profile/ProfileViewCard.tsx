import type { UserType } from '@/types/user';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Pencil } from 'lucide-react';
import { getInitials } from '@/utils/user.utils';

type Props = {
  user: UserType;
  onStartEdit: () => void;
};

export const ProfileViewCard = ({ user, onStartEdit }: Props) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
        <div className="h-16 sm:h-24 bg-linear-to-r from-[#C6E3B4] via-[#D8ECD0] to-[#EDF5E9] relative">
          <div className="absolute inset-0 bg-[radial-gradient(120%_140%_at_100%_0%,rgba(237,245,233,0.8)_0%,rgba(237,245,233,0)_60%)]" />
        </div>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex min-w-0 flex-col gap-4 -mt-8 sm:-mt-12 relative">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="size-16 sm:size-24 shrink-0 rounded-full bg-[#3E8D35] border-4 border-white shadow-md flex items-center justify-center text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1 space-y-2 pt-8 sm:pt-12">
              <h1 className="wrap-anywhere text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                {user.name}
              </h1>
              <p className="wrap-anywhere text-sm text-muted-foreground">
                {user.email}
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-[#EDF5E9] text-[#2F6B29] border border-[#C6E3B4]/60 gap-1.5 font-medium px-2.5 py-0.5"
                >
                  <span className="size-2 rounded-full bg-[#3E8D35] shrink-0" />
                  Verdora member
                </Badge>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onStartEdit}
            className="w-full sm:w-auto sm:self-end min-h-11 px-4 rounded-xl border-[#3E8D35] text-[#2F6B29] hover:bg-[#3E8D35] hover:text-white transition-colors cursor-pointer gap-2"
          >
            <Pencil className="size-4" />
            <span>Edit profile</span>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-zinc-900 mb-2">
          Personal Information
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6">
          Your profile details and verified contact information.
        </p>

        <div className="divide-y divide-zinc-100">
          <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-baseline">
            <span className="text-sm font-medium text-zinc-500">Full name</span>
            <span className="sm:col-span-2 text-base font-semibold text-zinc-900 min-w-0 wrap-anywhere">
              {user.name}
            </span>
          </div>

          <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-baseline">
            <span className="text-sm font-medium text-zinc-500">Email</span>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-2.5">
              <span className="text-base font-semibold text-zinc-900 min-w-0 wrap-anywhere">
                {user.email}
              </span>
            </div>
          </div>

          <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-baseline">
            <span className="text-sm font-medium text-zinc-500">Phone</span>
            <span className="sm:col-span-2 text-base font-semibold text-zinc-900">
              {user.phone || '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewCard;
