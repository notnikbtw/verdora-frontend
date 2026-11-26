export const DEFAULT_SITE_URL = 'https://notnikbtw.github.io/verdora-frontend/';
const COVER_ALT = 'Verdora Flower Shop - a collection of potted plants';

type Page = {
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
};

const home: Page = {
  title: 'Indoor Plants & Garden Supplies | Verdora',
  description:
    'Explore indoor plants, flower pots, seeds and gardening supplies at Verdora.',
};

export const PUBLIC_PAGES: Record<string, Page> = {
  '/': home,
  '/catalog': {
    title: 'Plant & Garden Catalog | Verdora',
    description:
      "Browse Verdora's catalog of indoor plants, seeds, planters and tools for your home and garden.",
  },
  '/terms': {
    title: 'Terms of Service & Privacy Policy | Verdora',
    description:
      "Read Verdora's terms and learn how we handle account, checkout and order information.",
  },
};

const privateTitles = new Map([
  ['/login', 'Log in'],
  ['/register', 'Create an account'],
  ['/forgot-password', 'Forgot password'],
  ['/reset-password', 'Reset password'],
  ['/oauth/callback', 'Signing in'],
  ['/cart', 'Cart'],
  ['/checkout', 'Checkout'],
  ['/favorites', 'Favorites'],
  ['/profile', 'My profile'],
  ['/orders', 'My orders'],
  ['/order-result', 'Order confirmation'],
  ['/admin', 'Admin Panel'],
  ['/admin/categories', 'Admin Categories'],
  ['/admin/orders', 'Admin Orders'],
  ['/admin/products', 'Admin Products'],
  ['/admin/products/new', 'Create Product'],
  ['/admin/discounts', 'Admin Discounts'],
  ['/admin/reports', 'Admin Reports'],
]);

export const PRIVATE_PATHS = [...privateTitles.keys()];

export const normalizeSeoPath = (pathname: string) =>
  pathname.replace(/\/+$/, '').toLowerCase() || '/';

export const parseProductRouteId = (value?: string) => {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
};

const parseWebUrl = (value: string) => {
  const url = URL.canParse(value) ? new URL(value) : undefined;
  return url &&
    (url.protocol === 'https:' || url.protocol === 'http:') &&
    !url.username &&
    !url.password
    ? url
    : undefined;
};

export const resolveSiteUrl = (value: string) => {
  const url = parseWebUrl(value.trim());
  if (!url || url.search || url.hash) {
    throw new Error(
      'VITE_SITE_URL must be an absolute HTTP(S) URL without credentials, a query or a fragment.'
    );
  }
  return url.href.replace(/\/+$/, '') + '/';
};

export const getPageSeo = (pathname: string): Page => {
  const path = normalizeSeoPath(pathname);
  const page = PUBLIC_PAGES[path];
  if (page) return page;
  if (['/sales', '/products', '/categories'].includes(path))
    return PUBLIC_PAGES['/catalog'];
  const title =
    privateTitles.get(path) ??
    (/^\/orders\/[^/]+$/.test(path) ? 'Order details' : 'Page not found');
  return { title: `${title} | Verdora`, noindex: true };
};

const PRODUCT_TITLE_LIMIT = 60;
const PRODUCT_DESCRIPTION_LIMIT = 160;
const PRODUCT_IMAGE_ALT_LIMIT = 125;
const PRODUCT_TITLE_SUFFIX = ' | Verdora';

const normalizeText = (text: unknown) =>
  typeof text === 'string'
    ? text
        .replace(/[\uD800-\uDFFF]/gu, '\uFFFD')
        .replace(/\s+/g, ' ')
        .trim()
    : '';

const truncateText = (text: string, limit: number) => {
  const characters = Array.from(text);
  if (characters.length <= limit) return text;

  const prefix = characters.slice(0, limit - 1);
  const lastSpace = prefix.lastIndexOf(' ');
  const cutMidWord = prefix.at(-1) !== ' ' && characters[limit - 1] !== ' ';
  const useWordBoundary = cutMidWord && lastSpace >= (limit - 1) / 2;
  return `${(useWordBoundary ? prefix.slice(0, lastSpace) : prefix).join('').trimEnd()}…`;
};

export const getProductSeo = (product: {
  name?: unknown;
  description?: unknown;
  imageUrl?: unknown;
}): Page => {
  const name = normalizeText(product.name) || 'Product details';
  const title = truncateText(
    name,
    PRODUCT_TITLE_LIMIT - PRODUCT_TITLE_SUFFIX.length
  );
  const description =
    normalizeText(product.description) ||
    `Explore ${name} in the Verdora catalog.`;
  const image =
    typeof product.imageUrl === 'string'
      ? parseWebUrl(product.imageUrl.trim())
      : undefined;
  return {
    title: `${title}${PRODUCT_TITLE_SUFFIX}`,
    description: truncateText(description, PRODUCT_DESCRIPTION_LIMIT),
    image: image?.protocol === 'https:' ? image.href : undefined,
    imageAlt: truncateText(name, PRODUCT_IMAGE_ALT_LIMIT),
  };
};

export type HeadTag = {
  tag: 'title' | 'meta' | 'link';
  attrs?: Record<string, string>;
  text?: string;
};

export const canonicalUrl = (path: string, siteUrl: string) => {
  const route = normalizeSeoPath(path).replace(/^\//, '');
  return new URL(route ? `${route}/` : '', `${siteUrl.replace(/\/+$/, '')}/`)
    .href;
};

export const getSeoTags = (
  page: Page,
  path: string,
  siteUrl: string
): HeadTag[] => {
  const tags: HeadTag[] = [{ tag: 'title', text: page.title }];
  const meta = (name: string, content: string) =>
    tags.push({
      tag: 'meta',
      attrs: { [name.startsWith('og:') ? 'property' : 'name']: name, content },
    });
  if (page.noindex) {
    meta('robots', 'noindex, follow');
    return tags;
  }

  const url = canonicalUrl(path, siteUrl);
  const description = page.description ?? home.description!;
  const image =
    page.image ?? new URL('social-cover.jpg', canonicalUrl('/', siteUrl)).href;
  const alt = page.image ? (page.imageAlt ?? COVER_ALT) : COVER_ALT;
  tags.push({ tag: 'link', attrs: { rel: 'canonical', href: url } });
  meta('description', description);
  meta('og:type', 'website');
  meta('og:site_name', 'Verdora');
  meta('og:title', page.title);
  meta('og:description', description);
  meta('og:url', url);
  meta('og:image', image);
  meta('og:image:alt', alt);
  if (!page.image) {
    meta('og:image:width', '1200');
    meta('og:image:height', '630');
  }
  meta('twitter:card', 'summary_large_image');
  meta('twitter:title', page.title);
  meta('twitter:description', description);
  meta('twitter:image', image);
  meta('twitter:image:alt', alt);
  return tags;
};
