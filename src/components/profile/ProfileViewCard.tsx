import type { UserType } from '@/types/user';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { getInitials } from '@/utils/user.utils';

type Props = {
  user: UserType;
  onStartEdit: () => void;
  onOpenDelete: () => void;
};

export const ProfileViewCard = ({ user, onStartEdit, onOpenDelete }: Props) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
        <div className="h-28 bg-linear-to-r from-[#C6E3B4] via-[#D8ECD0] to-[#EDF5E9] relative">
          <div className="absolute inset-0 bg-[radial-gradient(120%_140%_at_100%_0%,rgba(237,245,233,0.8)_0%,rgba(237,245,233,0)_60%)]" />
        </div>

        <div className="px-6 pb-6 pt-0 flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="size-24 sm:size-28 shrink-0 rounded-full bg-[#3E8D35] border-4 border-white shadow-md flex items-center justify-center text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {getInitials(user.name)}
            </div>
            <div className="space-y-1 sm:pb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                {user.name}
              </h1>
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
            className="self-start sm:self-end h-10 px-4 rounded-xl border-[#3E8D35] text-[#2F6B29] hover:bg-[#3E8D35] hover:text-white transition-colors cursor-pointer gap-2"
          >
            <Pencil className="size-4" />
            <span>Edit profile</span>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-zinc-900 mb-2">
          Personal Information
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6">
          Your profile details and verified contact information.
        </p>

        <div className="divide-y divide-zinc-100">
          <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-baseline">
            <span className="text-sm font-medium text-zinc-500">Full name</span>
            <span className="sm:col-span-2 text-base font-semibold text-zinc-900 break-words">
              {user.name}
            </span>
          </div>

          <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-baseline">
            <span className="text-sm font-medium text-zinc-500">Email</span>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-2.5">
              <span className="text-base font-semibold text-zinc-900 break-words">
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

      <div className="rounded-2xl border border-rose-200 bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5 max-w-xl">
          <h3 className="text-base sm:text-lg font-bold text-zinc-900">
            Delete account
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Removes your profile, order history and saved plants. This cannot be
            undone.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onOpenDelete}
          className="border-rose-400 text-rose-700 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-colors shrink-0 h-10 px-4 rounded-xl cursor-pointer gap-2"
        >
          <Trash2 className="size-4" />
          <span>Delete account</span>
        </Button>
      </div>
    </div>
  );
};

export default ProfileViewCard;
