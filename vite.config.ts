import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const productionBase =
    process.env.VITE_BASE_PATH ||
    (repoName ? `/${repoName}/` : '/verdora-frontend/');

  return {
    base: mode === 'production' ? productionBase : '/',
    plugins: [react(), tailwindcss()],
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
