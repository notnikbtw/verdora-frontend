import type { UserType } from '@/types/user';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Settings, ShieldCheck, KeyRound, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type Props = {
  user: UserType;
  onOpenDelete: () => void;
};

export const ProfileSettingsTab = ({ user, onOpenDelete }: Props) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#EDF5E9] text-[#2F6B29]">
            <Settings className="size-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Account Settings
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your preferences, security settings, and notifications.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
          <ShieldCheck className="size-5 text-[#2F6B29]" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900">
              Security & Login
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Review authentication settings for {user.email}.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200/60">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700">
              <KeyRound className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-900">
                  Account Password
                </span>
                <Badge variant="secondary" className="text-[11px] font-normal">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Reset your password via email if you need to update it.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl cursor-pointer self-start sm:self-auto"
          >
            <Link to="/forgot-password">Reset Password</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-red-200/70 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-red-600">Danger Zone</h3>
            <p className="text-xs sm:text-sm text-zinc-600">
              Permanently delete your Verdora account and all associated order
              history.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onOpenDelete}
            className="border-red-300 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer gap-2 self-start sm:self-auto rounded-xl"
          >
            <Trash2 className="size-4" />
            <span>Delete Account</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsTab;
