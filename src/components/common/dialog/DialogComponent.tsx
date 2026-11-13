import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@components/ui/dialog';
import type React from 'react';
import { cn } from '@/lib/utils';

type Props = {
  triggerText?: string;
  children: React.ReactNode;
  headerTitle: string;
  headerDescription?: string;
  cancelText?: string;
  submitText?: string;
  submitDisabled?: boolean;
  onSubmit?: () => void;
  autoCloseOnSubmit?: boolean;
  thirdActionText?: string;
  thirdActionDisabled?: boolean;
  onThirdAction?: () => void;
  open?: boolean;
  loading?: boolean;
  contentClassName?: string;
  triggerClassName?: string;
  onOpenChange?: (open: boolean) => void;
};

export const DialogComponent = ({
  triggerText,
  children,
  headerTitle,
  headerDescription,
  cancelText = 'Cancel',
  submitText,
  submitDisabled = false,
  thirdActionText,
  thirdActionDisabled = false,
  onSubmit,
  onThirdAction,
  open,
  onOpenChange,
  contentClassName,
  triggerClassName,
  loading = false,
  autoCloseOnSubmit = true,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerText && (
        <DialogTrigger asChild>
          <Button className={triggerClassName ?? 'w-full text-center'}>
            {triggerText}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className={cn(
          'min-w-0 grid-cols-[minmax(0,1fr)] max-h-[calc(100dvh-2rem)] overflow-y-auto',
          contentClassName ?? 'sm:max-w-md'
        )}
      >
        <DialogHeader className="p-3">
          <DialogTitle>{headerTitle}</DialogTitle>

          {headerDescription && (
            <DialogDescription>{headerDescription}</DialogDescription>
          )}
        </DialogHeader>

        {children}

        <DialogFooter className="flex w-full flex-row flex-wrap items-center justify-between gap-3 sm:justify-between">
          {thirdActionText ? (
            <>
              <Button
                type="button"
                disabled={thirdActionDisabled || loading}
                onClick={onThirdAction}
                className="mr-auto"
              >
                {thirdActionText}
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange?.(false)}
                  disabled={loading}
                >
                  {cancelText}
                </Button>

                {submitText && (
                  <Button
                    onClick={() => {
                      onSubmit?.();
                      if (autoCloseOnSubmit) {
                        onOpenChange?.(false);
                      }
                    }}
                    type="submit"
                    disabled={submitDisabled || loading}
                  >
                    {loading ? 'Loading...' : submitText}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <Button
                type="button"
                onClick={() => onOpenChange?.(false)}
                className="mr-auto"
                disabled={loading}
              >
                {cancelText}
              </Button>

              {submitText && (
                <Button
                  onClick={() => {
                    onSubmit?.();
                    if (autoCloseOnSubmit) {
                      onOpenChange?.(false);
                    }
                  }}
                  type="submit"
                  disabled={submitDisabled || loading}
                >
                  {loading ? 'Loading...' : submitText}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogComponent;
