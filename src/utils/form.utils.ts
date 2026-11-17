import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/error.utils';

// Controlled fields are not registered as DOM refs in react-hook-form.
// React may commit their error attributes after the next animation frame.
export const focusFirstInvalidField = (formId: string) => {
  const form = document.getElementById(formId);
  if (!form) return;
  const focus = () => {
    const field = form.querySelector<HTMLElement>(
      '[aria-invalid="true"]:not(:disabled)'
    );
    if (!field?.isConnected) return;
    observer.disconnect();
    clearTimeout(timeout);
    field.focus({ preventScroll: true });
    field.scrollIntoView({ block: 'center', behavior: 'instant' });
  };
  const observer = new MutationObserver(focus);
  observer.observe(form, {
    attributes: true,
    attributeFilter: ['aria-invalid'],
    childList: true,
    subtree: true,
  });
  const timeout = window.setTimeout(() => observer.disconnect(), 1000);
  requestAnimationFrame(focus);
};

export const notifyFormError = (error: unknown) => {
  const fallback =
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
      ? error.message
      : undefined;
  const message =
    typeof error === 'string' ? error : getApiErrorMessage(error, fallback);
  toast.error(message, { toastId: message });
};
