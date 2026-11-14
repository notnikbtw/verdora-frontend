import { useRef, useState } from 'react';
import { toast, type Id } from 'react-toastify';

type Props = {
  message: string;
  onUndo: () => Promise<unknown>;
  closeToast: () => void;
  toastId: Id;
};

const UndoToast = ({ message, onUndo, closeToast, toastId }: Props) => {
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const handleUndo = async () => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    toast.pause({ id: toastId });
    try {
      await onUndo();
      closeToast();
    } catch {
      // MutationCache shows the error; keep Undo available for a retry.
    } finally {
      pendingRef.current = false;
      setPending(false);
      toast.play({ id: toastId });
    }
  };

  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-3">
      <span className="min-w-0 text-sm">{message}</span>
      <button
        type="button"
        disabled={pending}
        onClick={handleUndo}
        className="min-h-11 shrink-0 px-2 font-semibold underline underline-offset-4 disabled:opacity-50"
      >
        {pending ? 'Restoring…' : 'Undo'}
      </button>
    </div>
  );
};

export default UndoToast;
