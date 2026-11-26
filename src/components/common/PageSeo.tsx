import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import {
  DEFAULT_SITE_URL,
  canonicalUrl,
  getPageSeo,
  getProductSeo,
  getSeoTags,
  normalizeSeoPath,
  resolveSiteUrl,
} from '@/config/seo.config';
import type { Product } from '@/types/product';

const siteUrl = resolveSiteUrl(
  import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL
);

export const PageSeo = ({
  page,
  path,
  preserveExisting = false,
}: {
  page: Parameters<typeof getSeoTags>[0];
  path: string;
  preserveExisting?: boolean;
}) => {
  const tags = getSeoTags(page, path, siteUrl);
  const signature = JSON.stringify(tags);
  const url = canonicalUrl(path, siteUrl);

  useEffect(() => {
    if (
      preserveExisting &&
      document.head
        .querySelector('link[data-seo][rel="canonical"]')
        ?.getAttribute('href') === url
    )
      return;
    const headTags = JSON.parse(signature) as ReturnType<typeof getSeoTags>;
    document.head
      .querySelectorAll('[data-seo]')
      .forEach(element => element.remove());
    for (const { tag, attrs, text } of headTags) {
      const element = document.createElement(tag);
      element.setAttribute('data-seo', '');
      for (const [name, value] of Object.entries(attrs ?? {}))
        element.setAttribute(name, value);
      if (text !== undefined) element.textContent = text;
      document.head.appendChild(element);
    }
  }, [preserveExisting, signature, url]);

  return null;
};

export const RouteSeo = () => {
  const { pathname } = useLocation();
  const path = normalizeSeoPath(pathname);
  if (matchPath('/products/:id', path)) return null;
  const canonicalPath = ['/sales', '/products', '/categories'].includes(path)
    ? '/catalog'
    : path;
  return <PageSeo page={getPageSeo(path)} path={canonicalPath} />;
};

export const ProductSeo = ({
  product,
  invalid,
}: {
  product?: Product;
  invalid: boolean;
}) => {
  const { pathname } = useLocation();
  // Keep the server-generated product tags during loading. Replace them when the API resolves.
  return (
    <PageSeo
      page={
        invalid
          ? getPageSeo(pathname)
          : product
            ? getProductSeo(product)
            : { title: 'Product details | Verdora' }
      }
      path={pathname}
      preserveExisting={!invalid && !product}
    />
  );
};
