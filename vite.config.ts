import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { seoPlugin } from './scripts/seo-build.ts';
import { DEFAULT_SITE_URL, resolveSiteUrl } from './src/config/seo.config.ts';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), [
    'VITE_SITE_URL',
    'SEO_PRODUCT_API_URL',
  ]);
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const productionBase =
    process.env.VITE_BASE_PATH ||
    (repoName ? `/${repoName}/` : '/verdora-frontend/');

  return {
    base: mode === 'production' ? productionBase : '/',
    plugins: [
      react(),
      tailwindcss(),
      seoPlugin(
        resolveSiteUrl(
          process.env.VITE_SITE_URL || env.VITE_SITE_URL || DEFAULT_SITE_URL
        ),
        mode === 'production'
          ? process.env.SEO_PRODUCT_API_URL || env.SEO_PRODUCT_API_URL
          : undefined
      ),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
        '@components': path.resolve(import.meta.dirname, './src/components'),
        '@hooks': path.resolve(import.meta.dirname, './src/hooks'),
        '@pages': path.resolve(import.meta.dirname, './src/pages'),
        '@api': path.resolve(import.meta.dirname, './src/api'),
        '@fixtures': path.resolve(import.meta.dirname, './src/fixtures'),
        '@assets': path.resolve(import.meta.dirname, './src/assets'),
      },
    },
  };
});
