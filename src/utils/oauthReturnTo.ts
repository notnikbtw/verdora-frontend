const STORAGE_KEY = 'verdora:oauth-return-to';
const MAX_AGE_MS = 10 * 60 * 1000;

const safePath = (value: unknown): string | null => {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\')
  )
    return null;
  if ([...value].some(char => char.charCodeAt(0) < 32)) return null;
  const pathname = value.split(/[?#]/)[0];
  if (
    ['/login', '/register', '/oauth/callback'].includes(
      pathname.replace(/\/$/, '')
    )
  )
    return null;
  return value;
};

export const getOAuthReturnTo = (state: unknown): string => {
  if (!state || typeof state !== 'object' || !('from' in state)) return '/';
  const from = state.from;
  if (typeof from === 'string') return safePath(from) ?? '/';
  if (
    !from ||
    typeof from !== 'object' ||
    !('pathname' in from) ||
    typeof from.pathname !== 'string'
  )
    return '/';
  const search =
    'search' in from &&
    typeof from.search === 'string' &&
    from.search.startsWith('?')
      ? from.search
      : '';
  const hash =
    'hash' in from && typeof from.hash === 'string' && from.hash.startsWith('#')
      ? from.hash
      : '';
  return safePath(`${from.pathname}${search}${hash}`) ?? '/';
};

export const saveOAuthReturnTo = (to: string): void => {
  try {
    const destination = safePath(to);
    if (!destination || destination === '/') {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ to: destination, createdAt: Date.now() })
    );
  } catch {
    // OAuth can still proceed when browser storage is disabled.
  }
};

export const readOAuthReturnTo = (): string | null => {
  try {
    const stored: unknown = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) || 'null'
    );
    if (
      !stored ||
      typeof stored !== 'object' ||
      !('to' in stored) ||
      !('createdAt' in stored) ||
      typeof stored.createdAt !== 'number'
    )
      return null;
    const age = Date.now() - stored.createdAt;
    if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_MS) return null;
    return safePath(stored.to);
  } catch {
    return null;
  }
};

export const clearOAuthReturnTo = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be disabled by the browser.
  }
};
