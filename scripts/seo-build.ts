import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';
import {
  canonicalUrl,
  getPageSeo,
  getProductSeo,
  getSeoTags,
  PRIVATE_PATHS,
  PUBLIC_PAGES,
} from '../src/config/seo.config.ts';

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    character =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ]!
  );
const MARKER = '<!-- page-seo -->';
const METADATA_BLOCK = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/;

const renderHead = (...args: Parameters<typeof getSeoTags>) => {
  const tags = getSeoTags(...args).map(({ tag, attrs, text }) => {
    const attributes = Object.entries(attrs ?? {})
      .map(([key, value]) => ` ${key}="${escapeHtml(value)}"`)
      .join('');
    return `<${tag} data-seo${attributes}>${text === undefined ? '' : `${escapeHtml(text)}</${tag}>`}`;
  });
  return ['<!-- seo:start -->', ...tags, '<!-- seo:end -->'].join('\n    ');
};

type Product = {
  productId: number;
  name: string;
  description?: unknown;
  imageUrl?: unknown;
};

const isProduct = (value: unknown): value is Product => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Product>;
  return (
    typeof item.productId === 'number' &&
    Number.isSafeInteger(item.productId) &&
    item.productId > 0 &&
    typeof item.name === 'string' &&
    Boolean(item.name.trim())
  );
};

const loadProducts = async (apiUrl: string) => {
  const products = new Map<number, Product>();
  const signal = AbortSignal.timeout(25_000);
  // Use a stable order across pages and bound the public catalog fetch.
  for (let page = 0; page < 100; page++) {
    const url = new URL(`${apiUrl.replace(/\/+$/, '')}/products`);
    url.search = new URLSearchParams({
      page: String(page),
      size: '100',
      sort: 'id,asc',
    }).toString();
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
    const { data } = (await response.json()) as {
      data?: { content?: unknown; totalPages?: number };
    };
    if (
      !Array.isArray(data?.content) ||
      typeof data.totalPages !== 'number' ||
      !Number.isInteger(data.totalPages) ||
      data.totalPages < 0
    ) {
      throw new Error('Unexpected catalog pagination');
    }
    for (const product of data.content) {
      if (isProduct(product)) products.set(product.productId, product);
    }
    if (page + 1 >= data.totalPages) return [...products.values()];
  }
  throw new Error('Catalog exceeds the build page limit');
};

export const seoPlugin = (siteUrl: string, productApiUrl?: string): Plugin => {
  let outDir: string;
  let build = false;
  return {
    name: 'verdora-seo',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
      build = config.command === 'build' && !config.build.watch;
    },
    transformIndexHtml(html) {
      return html.replace(MARKER, () =>
        renderHead(PUBLIC_PAGES['/'], '/', siteUrl)
      );
    },
    async writeBundle() {
      if (!build) return;
      const html = await readFile(join(outDir, 'index.html'), 'utf8');
      if (!METADATA_BLOCK.test(html))
        throw new Error('Missing SEO block in build HTML');
      const pages = new Map(Object.entries(PUBLIC_PAGES));
      if (productApiUrl) {
        try {
          for (const product of await loadProducts(productApiUrl)) {
            pages.set(`/products/${product.productId}`, getProductSeo(product));
          }
        } catch (error) {
          this.warn(
            `Product previews skipped: ${error instanceof Error ? error.message : 'catalog unavailable'}`
          );
        }
      }

      const outputPages = new Map([
        ...pages,
        ...PRIVATE_PATHS.map(path => [path, getPageSeo(path)] as const),
      ]);
      for (const [path, page] of outputPages) {
        if (path === '/') continue;
        const folder = join(outDir, path.slice(1));
        await mkdir(folder, { recursive: true });
        await writeFile(
          join(folder, 'index.html'),
          html.replace(METADATA_BLOCK, () => renderHead(page, path, siteUrl))
        );
      }

      const locations = [...pages.keys()].map(
        path =>
          `  <url><loc>${escapeHtml(canonicalUrl(path, siteUrl))}</loc></url>`
      );
      await writeFile(
        join(outDir, 'sitemap.xml'),
        [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...locations,
          '</urlset>',
          '',
        ].join('\n')
      );
    },
  };
};
