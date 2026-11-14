import { useState, useSyncExternalStore } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Checkbox } from '@components/ui/checkbox';
import { Spinner } from '@components/ui/spinner';
import PasswordField from '@components/common/forms/PasswordField';
import { AlertTriangle, Lock } from 'lucide-react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (password: string) => Promise<void>;
  isDeleting: boolean;
};

const subscribeViewport = (onChange: () => void) => {
  window.visualViewport?.addEventListener('resize', onChange);
  window.visualViewport?.addEventListener('scroll', onChange);
  window.addEventListener('resize', onChange);
  return () => {
    window.visualViewport?.removeEventListener('resize', onChange);
    window.visualViewport?.removeEventListener('scroll', onChange);
    window.removeEventListener('resize', onChange);
  };
};
const getViewport = () =>
  `${window.visualViewport?.height ?? window.innerHeight}:${window.visualViewport?.offsetTop ?? 0}`;

export const DeleteAccountModal = ({
  open,
  onOpenChange,
  onConfirmDelete,
  isDeleting,
}: Props) => {
  const [password, setPassword] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const viewport = useSyncExternalStore(
    subscribeViewport,
    getViewport,
    () => '0:0'
  );
  const [viewportHeight, viewportTop] = viewport.split(':').map(Number);

  const handleClose = () => {
    if (isDeleting) return;
    setPassword('');
    setAcknowledged(false);
    setTouchedPassword(false);
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedPassword(true);
    if (!password.trim() || !acknowledged || isDeleting) return;
    await onConfirmDelete(password);
  };

  const passwordError =
    touchedPassword && !password.trim() ? 'Password is required' : undefined;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-lg p-5 sm:p-8 rounded-2xl overflow-y-auto overscroll-contain"
        style={
          viewportHeight > 0
            ? {
                top: viewportTop + viewportHeight / 2,
                maxHeight: Math.max(0, viewportHeight - 32),
              }
            : { maxHeight: 'calc(100dvh - 2rem)' }
        }
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5 text-rose-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-zinc-900 tracking-tight">
              Delete your Verdora account?
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-zinc-600 leading-relaxed text-left">
            This action is{' '}
            <strong className="text-rose-600">
              permanent and irreversible
            </strong>
            . Your profile, order history, saved addresses, and favorites will
            be permanently erased.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 text-xs sm:text-sm text-rose-800">
            Any active order still in delivery will be cancelled without a
            refund of the delivery fee.
          </div>

          <div className="space-y-2">
            <PasswordField
              label="Confirm your password"
              placeholder="••••••••"
              value={password}
              disabled={isDeleting}
              containerClassName="min-h-11"
              onChange={val => {
                setPassword(val);
                if (!touchedPassword) setTouchedPassword(true);
              }}
              error={passwordError}
              leftIcon={<Lock className="size-4 text-zinc-400" />}
            />
          </div>

          <div className="flex items-start gap-3 pt-1">
            <Checkbox
              id="acknowledge-delete"
              checked={acknowledged}
              onCheckedChange={checked => setAcknowledged(checked === true)}
              disabled={isDeleting}
              className="mt-0.5"
            />
            <label
              htmlFor="acknowledge-delete"
              className="text-xs sm:text-sm text-zinc-600 select-none cursor-pointer leading-tight"
            >
              I understand that this action deletes my account and all
              associated data permanently.
            </label>
          </div>

          <DialogFooter className="sticky bottom-0 border-t border-zinc-100 bg-white pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
              className="w-full sm:w-auto min-h-11 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!password.trim() || !acknowledged || isDeleting}
              aria-busy={isDeleting}
              className="w-full sm:w-auto min-h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white gap-2 min-w-36"
            >
              {isDeleting ? (
                <>
                  <Spinner className="size-4 text-white" />
                  <span>Deleting…</span>
                </>
              ) : (
                <span>Delete my account</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountModal;
