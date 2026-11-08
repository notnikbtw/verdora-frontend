import type { CheckoutFormData } from '@/schemas/checkout.schema';

const draftKey = (userId: number) => `verdora:checkout:${userId}`;
const textFields = [
  'name',
  'email',
  'phone',
  'street',
  'building',
  'apartment',
  'pickupLocationId',
] as const;

export const readCheckoutDraft = (
  userId: number
): Partial<CheckoutFormData> => {
  try {
    const stored: unknown = JSON.parse(
      sessionStorage.getItem(draftKey(userId)) || 'null'
    );
    if (!stored || typeof stored !== 'object') return {};
    const data = stored as Record<string, unknown>;
    const draft: Partial<CheckoutFormData> = {};
    for (const field of textFields) {
      if (typeof data[field] === 'string') draft[field] = data[field];
    }
    if (
      data.deliveryMethod === 'delivery' ||
      data.deliveryMethod === 'pickup'
    ) {
      draft.deliveryMethod = data.deliveryMethod;
    }
    return draft;
  } catch {
    return {};
  }
};

export const saveCheckoutDraft = (
  userId: number,
  data: Partial<CheckoutFormData>
) => {
  try {
    sessionStorage.setItem(draftKey(userId), JSON.stringify(data));
  } catch {
    // Checkout remains usable when browser storage is unavailable.
  }
};

export const clearCheckoutDraft = (userId: number) => {
  try {
    sessionStorage.removeItem(draftKey(userId));
  } catch {
    // Storage may be disabled by the browser.
  }
};
